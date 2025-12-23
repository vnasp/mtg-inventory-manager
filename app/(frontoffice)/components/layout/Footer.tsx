'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  MdBolt,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdOpenInNew,
} from 'react-icons/md';
import PostFooter from './PostFooter';

interface ContactInfo {
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  x: string;
  address: string;
}

export default function Footer() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: '',
    instagram: '',
    facebook: '',
    x: '',
    address: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings?game=global');
        const body = await res.json().catch(() => ({}));
        if (body?.contact_info) {
          setContactInfo({
            email: body.contact_info.email || '',
            phone: body.contact_info.phone || '',
            instagram: body.contact_info.instagram || '',
            facebook: body.contact_info.facebook || '',
            x: body.contact_info.x || '',
            address: body.contact_info.address || '',
          });
        }
      } catch (e) {
        console.error('Error loading contact info:', e);
      }
    })();
  }, []);

  const addressLines = contactInfo.address.split('\n').filter(Boolean);

  return (
    <footer className="border-t border-slate-950 bg-slate-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Logo y descripción */}
          <div>
            <Image
              src="/assets/img/logo.png"
              width={180}
              height={80}
              alt="VuduGaming Logo"
              className="mb-4 h-24 w-auto"
            />
            <p className="mb-3 text-sm text-gray-400">
              Tienda de cartas coleccionables TCG en Chile. Cartas Magic: The
              Gathering (MTG), Pokémon TCG y más juegos de mesa. Cartas sueltas,
              selladas y accesorios en Santiago.
            </p>
            <a
              href="https://www.vudugaming.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 transition-colors hover:text-purple-300"
            >
              <MdBolt className="h-5 w-5" />
              <span>Ir a VuduGaming.cl</span>
            </a>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Contacto</h3>
            <ul className="space-y-3 text-sm">
              {contactInfo.email && (
                <li className="flex items-start gap-2">
                  <MdEmail className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="transition-colors hover:text-white"
                  >
                    {contactInfo.email}
                  </a>
                </li>
              )}
              {contactInfo.phone && (
                <li className="flex items-start gap-2">
                  <MdPhone className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
                  <a
                    href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                    className="transition-colors hover:text-white"
                  >
                    {contactInfo.phone}
                  </a>
                </li>
              )}
              {contactInfo.address && (
                <li className="flex items-start gap-2">
                  <MdLocationOn className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
                  <div>
                    {addressLines.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Ubicación - Mapa */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Ubicación</h3>
            <div className="h-[200px] w-full overflow-hidden rounded-lg bg-white p-1 shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.8406753939834!2d-70.61493262346724!3d-33.42541389633178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662cf5c53c82b65%3A0x5b1a3b8b0b8b8b8b!2sAv.%20Providencia%201108%2C%20Providencia%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1732894000000!5m2!1ses!2scl"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación VuduGaming"
              ></iframe>
            </div>
            <a
              href="https://maps.app.goo.gl/Vh6ufyt4RgmxpPH1A"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-purple-400 transition-colors hover:text-purple-300"
            >
              <MdOpenInNew className="h-4 w-4" />
              <span>Ver en Google Maps</span>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <PostFooter />
    </footer>
  );
}
