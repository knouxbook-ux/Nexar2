// license-keys.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import {
  KeyIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import QRCode from "qrcode";

interface LicenseKey {
  id: string;
  key: string;
  productId: string;
  productName: string;
  userId?: string;
  userEmail?: string;
  type: "trial" | "basic" | "pro" | "enterprise" | "lifetime";
  status: "active" | "inactive" | "expired" | "revoked";
  features: string[];
  maxDevices: number;
  activatedDevices: Device[];
  createdAt: Date;
  activatedAt?: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  notes?: string;
  createdBy: string;
}

interface Device {
  id: string;
  name: string;
  platform: string;
  lastIp?: string;
  lastSeen: Date;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  types: string[];
}

export default function LicenseKeys() {
  const { user, isAdmin } = useAuth();
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");

  const [newKey, setNewKey] = useState({
    productId: "",
    productName: "",
    type: "basic" as LicenseKey["type"],
    maxDevices: 1,
    expiresIn: 30,
    notes: "",
  });

  useEffect(() => {
    loadProducts();
    loadKeys();
  }, [user, filterStatus]);

  const loadProducts = async () => {
    try {
      const productsRef = collection(db, "products");
      const snapshot = await getDocs(productsRef);
      const productsData: Product[] = snapshot.docs.map((pDoc) => ({
        id: pDoc.id,
        ...pDoc.data(),
      })) as Product[];

      setProducts(productsData);

      if (productsData.length > 0) {
        setNewKey((prev) => ({
          ...prev,
          productId: productsData[0].id,
          productName: productsData[0].name,
        }));
      }
    } catch (error) {
      console.error("Load products error:", error);
    }
  };

  const loadKeys = async () => {
    try {
      const keysRef = collection(db, "licenseKeys");
      let q;

      if (isAdmin) {
        q = query(keysRef, orderBy("createdAt", "desc"), limit(100));
      } else {
        q = query(
          keysRef,
          where("userId", "==", user?.uid),
          orderBy("createdAt", "desc"),
        );
      }

      if (filterStatus !== "all") {
        q = query(q, where("status", "==", filterStatus));
      }

      const snapshot = await getDocs(q);
      const keysData: LicenseKey[] = snapshot.docs.map((keyDoc) => ({
        id: keyDoc.id,
        ...keyDoc.data(),
        createdAt: keyDoc.data().createdAt?.toDate(),
        activatedAt: keyDoc.data().activatedAt?.toDate(),
        expiresAt: keyDoc.data().expiresAt?.toDate(),
        lastUsed: keyDoc.data().lastUsed?.toDate(),
        activatedDevices:
          keyDoc.data().activatedDevices?.map((d: any) => ({
            ...d,
            lastSeen: d.lastSeen?.toDate(),
          })) || [],
      })) as LicenseKey[];

      setKeys(keysData);
    } catch (error) {
      console.error("Load keys error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    if (!user) return;

    try {
      const key = generateLicenseKey();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + newKey.expiresIn);

      const licenseKey: Omit<LicenseKey, "id"> = {
        key,
        productId: newKey.productId,
        productName: newKey.productName,
        type: newKey.type,
        status: "active",
        features: getFeaturesForType(newKey.type),
        maxDevices: newKey.maxDevices,
        activatedDevices: [],
        createdAt: serverTimestamp() as any,
        expiresAt,
        notes: newKey.notes,
        createdBy: user.uid,
      };

      await addDoc(collection(db, "licenseKeys"), licenseKey);

      setShowGenerateForm(false);
      setNewKey({
        productId: products[0]?.id || "",
        productName: products[0]?.name || "",
        type: "basic",
        maxDevices: 1,
        expiresIn: 30,
        notes: "",
      });

      loadKeys();
    } catch (error) {
      console.error("Generate key error:", error);
    }
  };

  const generateLicenseKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segments = [];

    for (let i = 0; i < 4; i += 1) {
      let segment = "";
      for (let j = 0; j < 4; j += 1) {
        segment += chars[Math.floor(Math.random() * chars.length)];
      }
      segments.push(segment);
    }

    return segments.join("-");
  };

  const getFeaturesForType = (type: string): string[] => {
    const features: Record<string, string[]> = {
      trial: ["مدة تجريبية 14 يوم", "جهاز واحد", "جميع الميزات الأساسية"],
      basic: ["ميزات أساسية", "جهاز واحد", "دعم عبر البريد"],
      pro: ["جميع الميزات", "3 أجهزة", "دعم فني مباشر", "تحديثات مجانية"],
      enterprise: ["جميع الميزات", "10 أجهزة", "دعم VIP", "تثبيت مخصص"],
      lifetime: [
        "جميع الميزات",
        "5 أجهزة",
        "دعم مدى الحياة",
        "تحديثات إلى الأبد",
      ],
    };

    return features[type] || features.basic;
  };

  const revokeKey = async (keyId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا المفتاح؟")) return;

    try {
      await updateDoc(doc(db, "licenseKeys", keyId), {
        status: "revoked",
      });

      loadKeys();
    } catch (error) {
      console.error("Revoke key error:", error);
    }
  };

  const removeKey = async (keyId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المفتاح نهائياً؟")) return;

    try {
      await deleteDoc(doc(db, "licenseKeys", keyId));
      loadKeys();
    } catch (error) {
      console.error("Delete key error:", error);
    }
  };

  const verifyKey = async (keyToVerify: string) => {
    try {
      const keysRef = collection(db, "licenseKeys");
      const q = query(keysRef, where("key", "==", keyToVerify));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("❌ مفتاح غير صالح");
        return;
      }

      const keyData = snapshot.docs[0].data() as LicenseKey;

      if (keyData.status !== "active") {
        alert(`❌ المفتاح غير نشط (الحالة: ${keyData.status})`);
        return;
      }

      if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
        alert("❌ المفتاح منتهي الصلاحية");
        return;
      }

      alert("✅ مفتاح صالح ✓");
    } catch (error) {
      console.error("Verify key error:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("تم النسخ");
  };

  const generateQR = async (key: string) => {
    try {
      const url = `nexar://activate?key=${key}`;
      const qr = await QRCode.toDataURL(url);
      setQrCode(qr);
      setShowQR(true);
    } catch (error) {
      console.error("Generate QR error:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: "text-green-400 bg-green-400/10",
      inactive: "text-gray-400 bg-gray-400/10",
      expired: "text-yellow-400 bg-yellow-400/10",
      revoked: "text-red-400 bg-red-400/10",
    };
    return colors[status] || "text-gray-400 bg-gray-400/10";
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      trial: "bg-blue-600",
      basic: "bg-green-600",
      pro: "bg-purple-600",
      enterprise: "bg-yellow-600",
      lifetime: "bg-red-600",
    };
    return colors[type] || "bg-gray-600";
  };

  const filteredKeys = keys.filter(
    (key) =>
      key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.productName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">مفاتيح الترخيص</h1>

          <div className="flex gap-4">
            <button
              onClick={() => setShowVerifyForm(true)}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              تحقق من مفتاح
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowGenerateForm(true)}
                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                توليد مفتاح
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن مفتاح..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="expired">منتهي</option>
            <option value="revoked">ملغي</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="text-center py-12">
            <KeyIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد مفاتيح</h3>
            <p className="text-gray-400">
              {isAdmin
                ? "قم بتوليد مفتاح جديد للبدء"
                : "ليس لديك أي مفاتيح ترخيص"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredKeys.map((key) => (
              <div
                key={key.id}
                className="bg-gray-800 rounded-2xl p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(
                          key.type,
                        )}`}
                      >
                        {key.type}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                          key.status,
                        )}`}
                      >
                        {key.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-2xl font-mono bg-gray-900 px-4 py-2 rounded-lg">
                        {key.key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.key)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                      >
                        <ClipboardDocumentIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => generateQR(key.key)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => revokeKey(key.id)}
                        className="p-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => removeKey(key.id)}
                        className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">المنتج</p>
                    <p className="font-bold">{key.productName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">تاريخ الإنشاء</p>
                    <p>{new Date(key.createdAt).toLocaleDateString("ar-EG")}</p>
                  </div>

                  {key.expiresAt && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">ينتهي في</p>
                      <p
                        className={
                          new Date(key.expiresAt) < new Date()
                            ? "text-red-400"
                            : ""
                        }
                      >
                        {new Date(key.expiresAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                  )}
                </div>

                {key.activatedDevices.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-400 mb-2">
                      الأجهزة المفعلة ({key.activatedDevices.length}/
                      {key.maxDevices})
                    </p>
                    <div className="space-y-2">
                      {key.activatedDevices.map((device) => (
                        <div
                          key={device.id}
                          className="flex items-center gap-3 text-sm bg-gray-700/50 p-2 rounded-lg"
                        >
                          <span className="text-xl">
                            {device.platform === "windows"
                              ? "🪟"
                              : device.platform === "mac"
                                ? "🍎"
                                : "📱"}
                          </span>
                          <span className="flex-1">{device.name}</span>
                          <span className="text-gray-400">
                            {new Date(device.lastSeen).toLocaleDateString(
                              "ar-EG",
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  {key.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 rounded-full text-xs flex items-center gap-1"
                    >
                      <CheckCircleIcon className="w-3 h-3 text-green-400" />
                      {feature}
                    </span>
                  ))}
                </div>

                {key.notes && (
                  <p className="mt-4 text-sm text-gray-400 bg-gray-700/30 p-3 rounded-lg">
                    {key.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showGenerateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-6">توليد مفتاح ترخيص جديد</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  المنتج
                </label>
                <select
                  value={newKey.productId}
                  onChange={(e) => {
                    const product = products.find(
                      (p) => p.id === e.target.value,
                    );
                    setNewKey({
                      ...newKey,
                      productId: e.target.value,
                      productName: product?.name || "",
                    });
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  نوع الترخيص
                </label>
                <select
                  value={newKey.type}
                  onChange={(e) =>
                    setNewKey({
                      ...newKey,
                      type: e.target.value as LicenseKey["type"],
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                >
                  <option value="trial">تجريبي - 14 يوم</option>
                  <option value="basic">أساسي - جهاز واحد</option>
                  <option value="pro">احترافي - 3 أجهزة</option>
                  <option value="enterprise">مؤسسات - 10 أجهزة</option>
                  <option value="lifetime">مدى الحياة - 5 أجهزة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  عدد الأجهزة المسموحة
                </label>
                <input
                  type="number"
                  value={newKey.maxDevices}
                  onChange={(e) =>
                    setNewKey({
                      ...newKey,
                      maxDevices: parseInt(e.target.value, 10),
                    })
                  }
                  min="1"
                  max="20"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  مدة الصلاحية (أيام)
                </label>
                <input
                  type="number"
                  value={newKey.expiresIn}
                  onChange={(e) =>
                    setNewKey({
                      ...newKey,
                      expiresIn: parseInt(e.target.value, 10),
                    })
                  }
                  min="1"
                  max="3650"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={newKey.notes}
                  onChange={(e) =>
                    setNewKey({ ...newKey, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateForm(false)}
                  className="flex-1 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={generateKey}
                  className="flex-1 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                >
                  توليد المفتاح
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVerifyForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-6">التحقق من مفتاح</h3>

            <div className="space-y-4">
              <input
                type="text"
                id="verifyKey"
                placeholder="أدخل المفتاح"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 font-mono focus:outline-none focus:border-purple-500"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowVerifyForm(false)}
                  className="flex-1 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    const input = document.getElementById(
                      "verifyKey",
                    ) as HTMLInputElement;
                    verifyKey(input.value);
                  }}
                  className="flex-1 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                >
                  تحقق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center">
            <h3 className="text-xl font-bold mb-4">QR Code</h3>

            <img src={qrCode} alt="QR Code" className="w-full mb-4" />

            <button
              onClick={() => setShowQR(false)}
              className="w-full py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
