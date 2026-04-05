import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Settings, Save } from "lucide-react";
import useReceiptSettingsStore from "../../store/useReceiptSettingsStore";

const ReceiptCustomization = () => {
  const {
    settings,
    loading,
    saving,
    error,
    fetchReceiptSettings,
    saveReceiptSettings,
  } = useReceiptSettingsStore();

  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    fetchReceiptSettings();
  }, [fetchReceiptSettings]);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      await saveReceiptSettings({
        ...draft,
        barcodeFontSize: Number(draft.barcodeFontSize) || 36,
      });
      toast.success("Receipt settings saved");
    } catch (e) {
      toast.error(e.message || "Failed to save receipt settings");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3">
      <div className="w-full space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Receipt Customization</h1>
              <p className="text-sm text-gray-600">Manage barcode and print settings for checkout receipts.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Store name</label>
              <input
                type="text"
                value={draft.storeName || ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, storeName: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Footer message</label>
              <input
                type="text"
                value={draft.footerMessage || ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, footerMessage: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Barcode wrapper</label>
              <input
                type="text"
                value={draft.barcodeWrapper || "*"}
                onChange={(e) => setDraft((prev) => ({ ...prev, barcodeWrapper: e.target.value.slice(0, 2) }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Barcode font size</label>
              <input
                type="number"
                min="18"
                max="72"
                value={draft.barcodeFontSize || 36}
                onChange={(e) => setDraft((prev) => ({ ...prev, barcodeFontSize: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!draft.includeItemBarcode}
                onChange={(e) => setDraft((prev) => ({ ...prev, includeItemBarcode: e.target.checked }))}
              />
              Show item barcode
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!draft.showSaleBarcode}
                onChange={(e) => setDraft((prev) => ({ ...prev, showSaleBarcode: e.target.checked }))}
              />
              Show sale barcode
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
            <p className="text-xs text-gray-500 mb-2">Preview</p>
            <p className="text-lg font-semibold text-gray-900">{draft.storeName || "CASRI INVENTORY"}</p>
            <p className="text-sm text-gray-500">{draft.footerMessage || "Thank you for your business!"}</p>
            <p
              className="mt-3 text-center text-gray-900 leading-none"
              style={{
                fontSize: `${Number(draft.barcodeFontSize) || 36}px`,
                fontFamily: "'Libre Barcode 39 Text', monospace",
              }}
            >
              {(draft.barcodeWrapper || "*")}12345678{(draft.barcodeWrapper || "*")}
            </p>
            <p className="text-center text-xs text-gray-500 mt-1">12345678</p>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptCustomization;
