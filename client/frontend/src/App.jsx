import { useEffect, useState } from "react";
import QRCode from "qrcode";

const initialState = {
  phone: "",
  amount: "",
  status: "idle",
  message: "",
};

function App() {
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 9) {
      setForm((prev) => ({
        ...prev,
        status: "error",
        message: "Enter a valid phone number.",
      }));
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setForm((prev) => ({
        ...prev,
        status: "error",
        message: "Amount must be greater than 0.",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      status: "loading",
      message: "Sending STK push...",
    }));

    setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        status: "success",
        message: "STK push sent. Check the phone to complete payment.",
      }));
    }, 1200);
  };

  const resetStatus = () => {
    setForm((prev) => ({ ...prev, status: "idle", message: "" }));
  };

  const statusStyles = {
    idle: "bg-slate-100 text-slate-700",
    loading: "bg-amber-100 text-amber-700",
    success: "bg-emerald-100 text-emerald-700",
    error: "bg-rose-100 text-rose-700",
  };

  const [transactions, setTransactions] = useState([
    {
      id: "TXN-1024",
      phone: "0712345678",
      amount: "1,200",
      time: "Today, 09:32",
      status: "Success",
    },
    {
      id: "TXN-1023",
      phone: "0700111222",
      amount: "450",
      time: "Today, 09:10",
      status: "Pending",
    },
    {
      id: "TXN-1022",
      phone: "0799001122",
      amount: "980",
      time: "Yesterday, 18:42",
      status: "Failed",
    },
    {
      id: "TXN-1021",
      phone: "0719988776",
      amount: "2,500",
      time: "Yesterday, 17:05",
      status: "Success",
    },
  ]);

  const badgeStyles = {
    Success: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Failed: "bg-rose-100 text-rose-700",
  };

  const [qrInput, setQrInput] = useState(
    "M-PESA|PAYBILL|123456|ACC|INV-1001|AMT|100"
  );
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrStatus, setQrStatus] = useState("idle");
  const [qrError, setQrError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const response = await fetch("/api/transactions");
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (isMounted && Array.isArray(data)) {
          setTransactions(data);
        }
      } catch (error) {
        // Keep existing data on polling failures.
      }
    };

    poll();
    const interval = setInterval(poll, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const generateQr = async () => {
      setQrStatus("loading");
      setQrError("");
      try {
        const url = await QRCode.toDataURL(qrInput, {
          width: 220,
          margin: 1,
          color: { dark: "#0f172a", light: "#ffffff" },
        });
        setQrDataUrl(url);
        setQrStatus("success");
      } catch (error) {
        setQrStatus("error");
        setQrError("Failed to generate QR code.");
      }
    };

    generateQr();
  }, [qrInput]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 md:flex">
        <div className="text-xl font-semibold text-slate-900">Daraja Admin</div>
        <nav className="mt-8 space-y-2 text-sm font-medium text-slate-600">
          <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-left text-white">
            Dashboard
          </button>
          <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100">
            STK Push
          </button>
          <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100">
            Transactions
          </button>
          <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100">
            Callbacks
          </button>
        </nav>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <h1 className="text-xl font-semibold text-slate-900">
              STK Push Dashboard
            </h1>
          </div>
          <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Live
          </div>
        </header>

        <section className="flex flex-1 flex-col gap-6 p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">STK Push</h2>
                  <p className="text-sm text-slate-500">
                    Initiate a customer payment request.
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[form.status]}`}
                >
                  {form.status.toUpperCase()}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g. 0712345678"
                    value={form.phone}
                    onChange={handleChange}
                    onFocus={resetStatus}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    min="1"
                    placeholder="e.g. 100"
                    value={form.amount}
                    onChange={handleChange}
                    onFocus={resetStatus}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                {form.message && (
                  <div
                    className={`rounded-lg px-4 py-3 text-sm ${statusStyles[form.status]}`}
                  >
                    {form.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={form.status === "loading"}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {form.status === "loading" ? "Sending..." : "Send STK Push"}
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Quick Tips</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Use a valid M-Pesa phone number in local format.</li>
                <li>Confirm the prompt on the handset to complete payment.</li>
                <li>Use callbacks to update transaction status.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Transactions
                </h2>
                <p className="text-sm text-slate-500">
                  Track the latest M-Pesa requests and outcomes.
                </p>
              </div>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Export CSV
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">Transaction</th>
                    <th className="whitespace-nowrap px-4 py-3">Phone</th>
                    <th className="whitespace-nowrap px-4 py-3">Amount (KES)</th>
                    <th className="whitespace-nowrap px-4 py-3">Time</th>
                    <th className="whitespace-nowrap px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {transaction.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {transaction.phone}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {transaction.amount}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {transaction.time}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[transaction.status]}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    M-Pesa QR Code
                  </h2>
                  <p className="text-sm text-slate-500">
                    Generate a QR code for quick payments.
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[qrStatus] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {qrStatus.toUpperCase()}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Payload
                  </label>
                  <textarea
                    rows="4"
                    value={qrInput}
                    onChange={(event) => setQrInput(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                {qrError && (
                  <div className="rounded-lg bg-rose-100 px-4 py-3 text-sm text-rose-700">
                    {qrError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="M-Pesa QR Code"
                    className="h-48 w-48"
                  />
                ) : (
                  <span className="text-sm text-slate-400">No QR yet</span>
                )}
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Share this QR code with customers to scan and pay.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Ratiba Scheduling
                  </h2>
                  <p className="text-sm text-slate-500">
                    Set up recurring M-Pesa payments.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>

              <form className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Beneficiary Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ACME Supplies"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1500"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Frequency
                  </label>
                  <select className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400">
                    <option>Weekly</option>
                    <option>Bi-weekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-5002"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Schedule Ratiba
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Save Draft
                  </button>
                </div>
              </form>

              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Next run: <span className="font-semibold text-slate-900">Mar 01</span> •
                Status: <span className="font-semibold text-emerald-600">Approved</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Pull & Sync Transactions
                  </h2>
                  <p className="text-sm text-slate-500">
                    Fetch latest M-Pesa transactions and sync to the database.
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Pending
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Date Range
                  </label>
                  <select className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400">
                    <option>Last 24 hours</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Custom range</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Sync Mode
                  </label>
                  <select className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400">
                    <option>Incremental</option>
                    <option>Full refresh</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Pull Transactions
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    View Logs
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <span>Last sync completed</span>
                  <span className="font-semibold">08:45 AM</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <span>In progress: 12 transactions</span>
                  <span className="font-semibold">42%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <span>Failed records</span>
                  <span className="font-semibold">2</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
