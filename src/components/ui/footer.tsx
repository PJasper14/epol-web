"use client";

import React from "react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="h-6 w-6 rounded-full overflow-hidden bg-white p-0.5 shadow-sm">
                <Image
                  src="/images/EPOL LOGO.jpg"
                  alt="EPOL Logo"
                  width={20}
                  height={20}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="h-6 w-6 rounded-full overflow-hidden bg-white p-0.5 shadow-sm">
                <Image
                  src="/images/CABUYAO LOGO.jpg"
                  alt="Cabuyao Logo"
                  width={20}
                  height={20}
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="text-gray-700 text-sm font-medium">
                © {new Date().getFullYear()} Environmental Police Administration System. All rights reserved.
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
