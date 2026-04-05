import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle } from "lucide-react";

const LowStockReminder = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLowStock = async () => {
    try {
      const { data } = await axios.get("/api/products/low-stock"); // 👈 match backend route
      setLowStockProducts(data);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStock(); // fetch first time immediately
    const interval = setInterval(fetchLowStock, 60000); // refresh every 60s

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  if (loading) {
    return <p className="text-gray-500">...</p>;
  }

  if (lowStockProducts.length === 0) {
    return null; // hide if all products are okay
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg mt-4 shadow-md animate-pulse">
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-yellow-600 w-6 h-6" />
        <h2 className="text-yellow-800 font-semibold">Alaab dhamaanaysa 🚨</h2>
      </div>
      <ul className="mt-2 list-disc list-inside text-gray-700">
        {lowStockProducts.map((product) => (
          <li key={product.id}>
            {product.name} —{" "}
            <span className="font-bold text-red-600">{product.stock}</span>{" "}
            unug ka haray
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockReminder;
