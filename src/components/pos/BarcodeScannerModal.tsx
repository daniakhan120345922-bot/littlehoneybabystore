"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = { open: boolean; onClose: () => void; onScan: (barcode: string) => void };

export function BarcodeScannerModal({ open, onClose, onScan }: Props) {
  const scannerRef = useRef<InstanceType<typeof import("html5-qrcode").Html5Qrcode> | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "scanning" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const containerId = "lhbs-scanner";

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function start() {
      setStatus("starting");
      setErrorMsg(null);
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;
        const config = {
          fps: 10,
          qrbox: { width: 320, height: 200 },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
        };

        const startScanner = async (cameraConfig: unknown) => {
          await scanner.start(
            cameraConfig,
            config,
            (decoded) => {
              onScan(decoded.trim());
              void stop();
              onClose();
            },
            () => {}
          );
        };

        try {
          await startScanner({ facingMode: "environment" });
        } catch {
          const cameras = await Html5Qrcode.getCameras();
          if (cancelled) return;
          if (cameras.length > 0) {
            await startScanner(cameras[0].id);
          } else {
            throw new Error("No camera found");
          }
        }

        if (!cancelled) setStatus("scanning");
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(err instanceof Error ? err.message : "Camera unavailable");
        }
      }
    }

    async function stop() {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {
          /* noop */
        }
        scannerRef.current = null;
      }
    }

    void start();
    return () => {
      cancelled = true;
      void stop();
      setStatus("idle");
    };
  }, [open, onClose, onScan]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-stone-200">
        <div className="flex items-center justify-between border-b border-stone-100 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-stone-900">Camera scanner</h2>
              <p className="text-xs text-stone-500">Align barcode in frame</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-stone-100">
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>
        <div className="p-6">
          <div id={containerId} className="min-h-[260px] overflow-hidden rounded-2xl bg-transparent ring-4 ring-amber-200/40" />
          {status === "starting" && (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-stone-500">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> Starting…
            </p>
          )}
          {status === "error" && errorMsg && (
            <p className="mt-4 text-center text-sm text-red-600">{errorMsg}</p>
          )}
        </div>
        <div className="border-t border-stone-100 px-6 py-4">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
      <style jsx global>{`
        #${containerId},
        #${containerId} > div,
        #${containerId} * {
          background: transparent !important;
          background-color: transparent !important;
        }
        #${containerId} video,
        #${containerId} canvas {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}
