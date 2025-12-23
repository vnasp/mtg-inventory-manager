'use client';
import { useState, useEffect } from 'react';
import { MdEmail, MdPhone } from 'react-icons/md';
import { FaFacebook, FaInstagram, FaXTwitter } from 'react-icons/fa6';

interface ContactInfo {
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  x: string;
  address: string;
}

export default function TopBar() {
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
        // Usar valores por defecto en caso de error
        console.error('Error loading contact info:', e);
      }
    })();
  }, []);

  return (
    <div className="border-b border-slate-950 bg-slate-800 text-white">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="hidden items-center gap-4 md:flex">
            {contactInfo.email && (
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
              >
                <MdEmail className="h-4 w-4" />
                <span>{contactInfo.email}</span>
              </a>
            )}
            {contactInfo.phone && (
              <a
                href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
              >
                <MdPhone className="h-4 w-4" />
                <span>{contactInfo.phone}</span>
              </a>
            )}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-xs text-gray-400">Síguenos:</span>
            {contactInfo.facebook && (
              <a
                href={contactInfo.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
                aria-label="Facebook"
              >
                <FaFacebook className="h-5 w-5" />
              </a>
            )}
            {contactInfo.instagram && (
              <a
                href={contactInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
                aria-label="Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
            )}
            {contactInfo.x && (
              <a
                href={contactInfo.x}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
                aria-label="X (Twitter)"
              >
                <FaXTwitter className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
