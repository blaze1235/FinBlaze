import React, { useState } from "react";
import { Product } from "../types";
import { formatCurrency } from "../utils";
import { ShoppingBag, Search, PlusCircle, Trash2, ArrowUpDown, ShieldAlert, BadgePlus } from "lucide-react";

interface InventoryViewProps {
  products: Product[];
  onUpdateInventoryPrice: (productId: string, newPrice: number) => void;
  onUpdateInventoryStock: (productId: string, newStock: number) => void;
  onAddNewProduct: (newProduct: Product) => void;
}

export default function InventoryView({
  products,
  onUpdateInventoryPrice,
  onUpdateInventoryStock,
  onAddNewProduct,
}: InventoryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Adding custom product inputs
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<"Drinks" | "Snacks" | "Mains" | "Devices">("Drinks");
  const [newProdPrice, setNewProdPrice] = useState<number>(12000);
  const [newProdStock, setNewProdStock] = useState<number>(30);
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  const categories = ["ALL", "Drinks", "Snacks", "Mains", "Devices"];

  const filtered = products.filter((prod) => {
    const matchCat = selectedCategory === "ALL" || prod.category === selectedCategory;
    const matchSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      setFormFeedback("Product name is required.");
      return;
    }

    const created: Product = {
      id: `p-${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      price: Number(newProdPrice),
      stock: Number(newProdStock),
    };

    onAddNewProduct(created);
    setNewProdName("");
    setNewProdPrice(10000);
    setNewProdStock(30);
    setFormFeedback("Product registered successfully!");
    setTimeout(() => setFormFeedback(null), 3000);
  };

  return (
    <div id="bar-catalog-tab-view" className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent text-slate-300 backdrop-blur-sm">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300 tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">Bar POS Inventory & Catalog</h2>
          <p className="text-xs text-white/50 mt-1">
            Configure lounge retail pricing, audit inventory stock balances, and register new consumable nodes.
          </p>
        </div>
      </div>

      {/* Main split dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left side: Search & list catalog */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-3 rounded-xl shadow-[inset_0_1px_4px_rgba(255,255,255,0.05)]">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Lookup product by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-xs font-mono rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-white placeholder-white/30 backdrop-blur-md transition-all"
              />
            </div>

            {/* Categories filter layout */}
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] font-bold px-4 py-2 rounded-full border transition-all shrink-0 ${
                    selectedCategory === cat
                      ? "bg-cyan-500/20 text-cyan-100 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                      : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table display */}
          <div className="glass-panel rounded-xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/5 text-white/50 font-mono text-[10px] uppercase tracking-wider border-b border-white/10">
                    <th className="p-4">Product Info</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-right">Retail Price</th>
                    <th className="p-4 text-center">Stock Level</th>
                    <th className="p-4 text-right">Instant Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((item) => {
                    const isLowStock = item.stock <= 10;
                    const isOutOfStock = item.stock === 0;

                    return (
                      <tr key={item.id} className="hover:bg-cyan-500/5 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                              <ShoppingBag className="w-4 h-4" />
                            </span>
                            <span className="font-bold text-white text-[13px] group-hover:text-cyan-50">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-white/5 font-mono text-[9px] text-white/60 px-2 py-1 rounded border border-white/10">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono">
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => onUpdateInventoryPrice(item.id, Number(e.target.value))}
                              step={1000}
                              min={0}
                              className="w-24 bg-black/40 border border-white/10 text-right rounded-md px-2 py-1 text-fuchsia-400 font-bold focus:outline-none focus:border-fuchsia-500/50 backdrop-blur-md transition-all"
                            />
                            <span className="text-[9px] text-white/40">UZS</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-2 bg-white/5 rounded-md border border-white/10 p-1">
                            <button
                              onClick={() => onUpdateInventoryStock(item.id, Math.max(0, item.stock - 1))}
                              className="hover:bg-white/10 text-slate-400 hover:text-white px-2 py-0.5 rounded font-bold transition-colors"
                            >
                              -
                            </button>
                            <span className={`w-8 font-mono font-bold text-xs ${
                              isOutOfStock 
                                ? "text-fuchsia-500 underline drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]" 
                                : isLowStock 
                                ? "text-fuchsia-300" 
                                : "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]"
                            }`}>
                              {item.stock}
                            </span>
                            <button
                              onClick={() => onUpdateInventoryStock(item.id, item.stock + 1)}
                              className="hover:bg-white/10 text-slate-400 hover:text-white px-2 py-0.5 rounded font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {isOutOfStock ? (
                            <span className="text-[10px] text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg px-2.5 py-1 font-semibold font-mono animate-pulse shadow-[0_0_10px_rgba(217,70,239,0.2)]">
                              OUT OF STOCK
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[10px] text-fuchsia-300 bg-fuchsia-950/40 border border-fuchsia-500/20 rounded-lg px-2.5 py-1 font-mono">
                              LOW STOCK
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">STOCK OK</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-white/40 font-mono">
                        No food/drink stock available in this catalog view matching query: "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right side: Register New Products node form */}
        <div className="glass-panel rounded-2xl p-6 space-y-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] sticky top-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
              <BadgePlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wide font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Register New Snack</h3>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            Append newly added food packages, drinks bottle inventory, or rental gear peripherals directly into the POS system.
          </p>

          <form onSubmit={handleCreateProduct} className="space-y-4 font-sans text-xs">
            {formFeedback && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono rounded-xl text-center animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                {formFeedback}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-mono">
                Item Title Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sprite 0.5L Bot"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono backdrop-blur-md"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-mono">
                Store Catalog Segment
              </label>
              <select
                value={newProdCategory}
                onChange={(e) => setNewProdCategory(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono backdrop-blur-md appearance-none"
              >
                <option value="Drinks" className="bg-slate-900">Drinks Sector</option>
                <option value="Snacks" className="bg-slate-900">Snacks Sector</option>
                <option value="Mains" className="bg-slate-900">Mains Sector</option>
                <option value="Devices" className="bg-slate-900">Devices / Rental</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-mono">
                  Price (UZS)
                </label>
                <input
                  type="number"
                  required
                  step={1000}
                  min={0}
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono backdrop-blur-md"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-mono">
                  Initial Qty Stock
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono backdrop-blur-md"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500/80 to-fuchsia-500/80 hover:from-cyan-400 hover:to-fuchsia-400 text-slate-900 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-5 transition-all uppercase font-mono text-[11px] shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.4)]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Confirm New Item</span>
            </button>
          </form>

          {/* Low Stock Warning Section */}
          <div className="mt-6 p-4 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl space-y-2 font-mono text-[11px] shadow-[inset_0_1px_5px_rgba(217,70,239,0.1)]">
            <span className="text-fuchsia-400 font-bold flex items-center gap-2 text-xs">
              <ShieldAlert className="w-4 h-4" /> Live Restock Ledger
            </span>
            <p className="text-white/40 text-[10px] leading-snug">
              Auto-flags items when stock sinks beneath 10 units. Verify distributor schedules in general configuration.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
