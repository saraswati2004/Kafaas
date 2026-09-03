import React, { useState } from 'react';
import { useProducts, useProductAdminMutations } from '../../hooks/useProducts';
import { Product, ProductStatus, ProductCategory } from '../../types/product.types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { 
  Package, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Eye,
  SlidersHorizontal,
  Leaf
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useProducts({
    search: searchQuery || undefined,
    category: selectedCategory === 'all' ? undefined : (selectedCategory as ProductCategory),
    page,
    limit: 10,
  });

  const { createProduct, isCreating, updateProduct, isUpdating, deleteProduct } = useProductAdminMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    brand: 'Bayer CropScience',
    category: 'Fungicides' as ProductCategory,
    sku: '',
    price: 1000,
    originalPrice: 1200,
    packSize: '500 ml',
    form: 'Liquid' as any,
    stockQuantity: 100,
    status: 'active' as ProductStatus,
    isOrganic: false,
    technicalName: '',
    dosagePerAcre: '200ml - 300ml in 200L water',
    dosagePerLiter: '1ml - 1.5ml / Litre',
    targetCrops: 'Tomato, Cotton, Paddy',
    targetPestsAndDiseases: 'Blight, Rust, Powdery Mildew',
    waitingPeriodDays: 14,
    description: '',
    mainImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      brand: 'Bayer CropScience',
      category: 'Fungicides',
      sku: `AGR-${Date.now().toString().slice(-6)}`,
      price: 950,
      originalPrice: 1100,
      packSize: '500 ml',
      form: 'Liquid',
      stockQuantity: 100,
      status: 'active',
      isOrganic: false,
      technicalName: 'Azoxystrobin 23% SC',
      dosagePerAcre: '200ml in 200 Litres water',
      dosagePerLiter: '1ml / Litre',
      targetCrops: 'Tomato, Chilli, Paddy',
      targetPestsAndDiseases: 'Early Blight, Anthracnose',
      waitingPeriodDays: 14,
      description: 'High-efficacy broad spectrum systemic agricultural formulation.',
      mainImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      sku: p.sku,
      price: p.price,
      originalPrice: p.originalPrice,
      packSize: p.packSize,
      form: p.form,
      stockQuantity: p.stockQuantity,
      status: p.status,
      isOrganic: p.isOrganic,
      technicalName: p.specifications.technicalName,
      dosagePerAcre: p.specifications.dosagePerAcre,
      dosagePerLiter: p.specifications.dosagePerLiter,
      targetCrops: p.specifications.targetCrops.join(', '),
      targetPestsAndDiseases: p.specifications.targetPestsAndDiseases.join(', '),
      waitingPeriodDays: p.specifications.waitingPeriodDays,
      description: p.description,
      mainImage: p.mainImage,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) return;

    const payload: Partial<Product> = {
      name: form.name,
      brand: form.brand,
      category: form.category,
      sku: form.sku,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice),
      packSize: form.packSize,
      form: form.form,
      stockQuantity: Number(form.stockQuantity),
      inStock: Number(form.stockQuantity) > 0,
      status: form.status,
      isOrganic: form.isOrganic,
      description: form.description,
      shortDescription: form.description.slice(0, 80),
      mainImage: form.mainImage,
      specifications: {
        technicalName: form.technicalName,
        formulation: `${form.form} Formulation`,
        dosagePerAcre: form.dosagePerAcre,
        dosagePerLiter: form.dosagePerLiter,
        targetCrops: form.targetCrops.split(',').map((c) => c.trim()),
        targetPestsAndDiseases: form.targetPestsAndDiseases.split(',').map((d) => d.trim()),
        applicationMethod: 'Foliar Spray',
        waitingPeriodDays: Number(form.waitingPeriodDays),
        toxicityClass: 'Blue (Moderate)',
        manufacturer: form.brand,
        countryOfOrigin: 'India',
        shelfLifeMonths: 24,
      },
    };

    if (editingProduct) {
      await updateProduct({ id: editingProduct.id, updates: payload });
    } else {
      await createProduct(payload);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (p: Product) => {
    const nextStatus: ProductStatus = p.status === 'active' ? 'inactive' : 'active';
    updateProduct({ id: p.id, updates: { status: nextStatus } });
  };

  const statusVariant = {
    active: 'green',
    draft: 'yellow',
    inactive: 'gray',
    out_of_stock: 'red',
    discontinued: 'red',
  } as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Product Catalog Management (CRUD)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create agricultural listings, assign technical specifications, and manage pricing & status.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold"
        >
          Create New Product
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by product, brand, or technical name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs bg-white pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium"
          >
            <option value="all">All Categories</option>
            <option value="Fertilizers">Fertilizers</option>
            <option value="Fungicides">Fungicides</option>
            <option value="Pesticides">Pesticides</option>
            <option value="Herbicides">Herbicides</option>
            <option value="Seeds">Seeds</option>
            <option value="Bio Products">Bio Products</option>
            <option value="Crop Protection">Crop Protection</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Product & Technical</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Pack & Form</th>
                <th className="py-4 px-4 text-right">Price</th>
                <th className="py-4 px-4 text-right">Stock</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {response?.items.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-10 h-10 rounded-xl bg-slate-100 p-1 object-contain border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 block">{prod.name}</span>
                          {prod.isOrganic && (
                            <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 italic block font-mono">
                          {prod.specifications.technicalName}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700">
                    {prod.category}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                    {prod.packSize}
                    <span className="block text-[10px] text-slate-400 font-sans">{prod.form}</span>
                  </td>
                  <td className="py-4 px-4 text-right font-extrabold text-slate-900">
                    ₹{prod.price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-slate-800">
                    {prod.stockQuantity}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleStatus(prod)}
                      title="Click to toggle status"
                    >
                      <Badge variant={statusVariant[prod.status]} size="sm" dot>
                        {prod.status.toUpperCase()}
                      </Badge>
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(prod.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {response && response.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-center">
            <Pagination
              currentPage={response.page}
              totalPages={response.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Agricultural Product'}
        description="Enter full technical details, dosage rates, and pricing."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Commercial Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Brand / Manufacturer *"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              >
                <option value="Fertilizers">Fertilizers</option>
                <option value="Fungicides">Fungicides</option>
                <option value="Pesticides">Pesticides</option>
                <option value="Herbicides">Herbicides</option>
                <option value="Seeds">Seeds</option>
                <option value="Bio Products">Bio Products</option>
                <option value="Crop Protection">Crop Protection</option>
              </select>
            </div>

            <Input
              label="SKU Code *"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status *</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Selling Price (₹) *"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
            />
            <Input
              label="Original MRP (₹)"
              type="number"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
            />
            <Input
              label="Stock Quantity *"
              type="number"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Technical Composition / Active Molecule *"
              value={form.technicalName}
              onChange={(e) => setForm({ ...form, technicalName: e.target.value })}
              placeholder="e.g. Tebuconazole 50% + Trifloxystrobin 25% WG"
              required
            />
            <Input
              label="Pack Size"
              value={form.packSize}
              onChange={(e) => setForm({ ...form, packSize: e.target.value })}
              placeholder="e.g. 1 Litre, 500g"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Dosage per Acre"
              value={form.dosagePerAcre}
              onChange={(e) => setForm({ ...form, dosagePerAcre: e.target.value })}
            />
            <Input
              label="Dosage per Litre"
              value={form.dosagePerLiter}
              onChange={(e) => setForm({ ...form, dosagePerLiter: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Crops (comma separated)"
              value={form.targetCrops}
              onChange={(e) => setForm({ ...form, targetCrops: e.target.value })}
            />
            <Input
              label="Target Pests / Diseases"
              value={form.targetPestsAndDiseases}
              onChange={(e) => setForm({ ...form, targetPestsAndDiseases: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isOrganicCheck"
              checked={form.isOrganic}
              onChange={(e) => setForm({ ...form, isOrganic: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isOrganicCheck" className="text-xs font-semibold text-slate-700">
              100% Certified Bio-Organic Product
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isCreating || isUpdating}
              className="bg-purple-600 hover:bg-purple-700 font-bold"
            >
              {editingProduct ? 'Save Modifications' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
