import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { gunzipSync } from 'zlib';
import * as tar from 'tar-stream';
import { Readable } from 'stream';

const MTGJSON_URL = 'https://mtgjson.com/api/v5/AllPrintingsCSVFiles.tar.gz';

async function downloadAndExtractCardIdentifiers() {
  const res = await fetch(MTGJSON_URL);
  if (!res.ok) {
    throw new Error(
      `Error al descargar MTGJson CSV: ${res.status} ${res.statusText}`
    );
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Descomprimir el .gz
  const decompressed = gunzipSync(buffer);

  // Extraer el archivo cardIdentifiers.csv del tar
  return new Promise<string>((resolve, reject) => {
    const extract = tar.extract();
    let csvContent = '';

    extract.on('entry', (header: any, stream: any, next: any) => {
      if (
        header.name === 'cardIdentifiers.csv' ||
        header.name === 'AllPrintingsCSVFiles/cardIdentifiers.csv'
      ) {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: any) => chunks.push(chunk));
        stream.on('end', () => {
          csvContent = Buffer.concat(chunks).toString('utf8');
          next();
        });
        stream.on('error', (err: any) => reject(err));
      } else {
        stream.on('end', () => next());
        stream.resume();
      }
    });

    extract.on('finish', () => {
      if (csvContent) {
        resolve(csvContent);
      } else {
        reject(new Error('No se encontró cardIdentifiers.csv en el archivo'));
      }
    });

    extract.on('error', (err: any) => reject(err));

    // Crear un stream del buffer tar
    const readable = Readable.from(decompressed);
    readable.pipe(extract);
  });
}

function parseCSV(csvContent: string) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });

    rows.push(row);
  }

  return rows;
}

async function replaceAllData(
  supabase: any,
  rows: any[],
  batchSize = 1000,
  sendUpdate: (msg: string) => void
) {
  // 1. Eliminar todos los datos existentes
  sendUpdate('Eliminando datos existentes...');
  const { error: deleteError } = await supabase
    .from('mtg_cardidentifiers')
    .delete()
    .neq('uuid', ''); // Eliminar todos los registros que tengan uuid (todos)

  if (deleteError) {
    console.error('Error al eliminar datos:', deleteError);
    throw deleteError;
  }

  sendUpdate('Datos existentes eliminados');

  // 2. Insertar nuevos datos en lotes
  sendUpdate('Insertando nuevos datos...');
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from('mtg_cardidentifiers').insert(batch);

    if (error) {
      console.error('Error en insert batch:', error);
      throw error;
    }

    sendUpdate(
      `Insertados ${Math.min(i + batchSize, rows.length)} de ${rows.length} registros...`
    );
  }
}

export async function POST(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (message: string) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ message })}\n\n`)
        );
      };

      try {
        const supabase = createAdminClient();

        // 1. Descargar y extraer
        sendUpdate('Descargando AllPrintingsCSVFiles.tar.gz desde MTGJson...');
        const csvContent = await downloadAndExtractCardIdentifiers();
        sendUpdate('Archivo descargado y descomprimido correctamente');

        // 2. Parsear CSV
        sendUpdate('Parseando archivo cardIdentifiers.csv...');
        const parsedData = parseCSV(csvContent);
        sendUpdate(`${parsedData.length} registros parseados`);

        // 3. Preparar datos para la base de datos
        sendUpdate('Preparando datos para inserción...');
        const rows = parsedData.map((row) => ({
          uuid: row.uuid || null,
          cardkingdometchedid: row.cardKingdomEtchedId || null,
          cardkingdomfoilid: row.cardKingdomFoilId || null,
          cardkingdomid: row.cardKingdomId || null,
          cardspherefoilid: row.cardsphereFoilId || null,
          cardsphereid: row.cardsphereId || null,
          deckboxid: row.deckboxId || null,
          mcmid: row.mcmId || null,
          mcmmetaid: row.mcmMetaId || null,
          mtgarenaid: row.mtgArenaId || null,
          mtgjsonfoilversionid: row.mtgjsonFoilVersionId || null,
          mtgjsonnonfoilversionid: row.mtgjsonNonFoilVersionId || null,
          mtgjsonv4id: row.mtgjsonV4Id || null,
          mtgofoilid: row.mtgoFoilId || null,
          mtgoid: row.mtgoId || null,
          multiverseid: row.multiverseId || null,
          scryfallcardbackid: row.scryfallCardBackId || null,
          scryfallid: row.scryfallId || null,
          scryfallillustrationid: row.scryfallIllustrationId || null,
          scryfalloracleid: row.scryfallOracleId || null,
          tcgplayeretchedproductid: row.tcgplayerEtchedProductId || null,
          tcgplayerproductid: row.tcgplayerProductId || null,
        }));

        // 4. Actualizar base de datos
        sendUpdate(
          'Actualizando tabla mtg_cardidentifiers en base de datos...'
        );
        await replaceAllData(supabase, rows, 5000, sendUpdate);
        sendUpdate('Tabla actualizada correctamente');

        // Enviar resultado final
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              complete: true,
              stats: {
                recordsImported: rows.length,
              },
            })}\n\n`
          )
        );

        controller.close();
      } catch (error: any) {
        console.error('Error al actualizar card identifiers:', error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: error.message || 'Error al actualizar card identifiers' })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
