import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Plus, Trash2, Wallet } from "lucide-react";
import { useLiabilityStore } from "../../store/useLiabilityStore";

const LoanManagement = () => {
  const {
    liabilities,
    isLoading,
    getLiabilities,
    addLiablity,
    handleMarkAsPaid,
    deleteLiability,
  } = useLiabilityStore();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: 1,
  });
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getLiabilities();
  }, [getLiabilities]);

  const filteredRows = useMemo(() => {
    return liabilities.filter((item) => {
      const term = search.trim().toLowerCase();
      const matchText =
        !term ||
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && item.isPaid) ||
        (statusFilter === "unpaid" && !item.isPaid);

      return matchText && matchStatus;
    });
  }, [liabilities, search, statusFilter]);

  const totals = useMemo(() => {
    const total = filteredRows.reduce(
      (sum, row) => sum + (Number(row.price) || 0) * (Number(row.quantity) || 0),
      0
    );
    const unpaid = filteredRows
      .filter((row) => !row.isPaid)
      .reduce(
        (sum, row) => sum + (Number(row.price) || 0) * (Number(row.quantity) || 0),
        0
      );
    return { total, unpaid };
  }, [filteredRows]);

  const onCreate = async (e) => {
    e.preventDefault();
    await addLiablity({
      name: form.name.trim(),
      description: form.description.trim() || "",
      price: Number(form.price),
      quantity: Number(form.quantity) || 1,
    });
    setForm({ name: "", description: "", price: "", quantity: 1 });
    setShowCreate(false);
    await getLiabilities();
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this account payable record?")) return;
    await deleteLiability(id);
    await getLiabilities();
  };

  const onMarkPaid = async (id) => {
    await handleMarkAsPaid(id);
    await getLiabilities();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Account Payables</h1>
                <p className="text-sm text-gray-600">Track unpaid and paid vendor obligations</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Payable
            </button>
          </div>
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <motion.form
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              onSubmit={onCreate}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create Account Payable</h3>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>

              <input
                required
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="Payable name"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
              />
              <input
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                placeholder="Description (optional)"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                  placeholder="Amount"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                />
                <input
                  min="1"
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm((s) => ({ ...s, quantity: e.target.value }))}
                  placeholder="Qty"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                  Save
                </button>
              </div>
            </motion.form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Records</p>
            <p className="text-2xl font-bold text-gray-900">{filteredRows.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Payables</p>
            <p className="text-2xl font-bold text-gray-900">${totals.total.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Unpaid Amount</p>
            <p className="text-2xl font-bold text-red-600">${totals.unpaid.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="grid grid-cols-2 gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                    Loading...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                    No account payable records found
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const rowTotal = (Number(row.price) || 0) * (Number(row.quantity) || 0);
                  return (
                    <tr key={row.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                      <td className="px-4 py-3 text-gray-600">{row.description || "-"}</td>
                      <td className="px-4 py-3 text-right">${Number(row.price || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">{row.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold">${rowTotal.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(row.soldAt || row.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.isPaid ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Paid</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Unpaid</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {!row.isPaid && (
                            <button
                              onClick={() => onMarkPaid(row.id)}
                              className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50"
                              title="Mark Paid"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(row.id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoanManagement;
