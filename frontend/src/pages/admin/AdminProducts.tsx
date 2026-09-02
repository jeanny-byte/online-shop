import React, { useEffect, useState } from 'react';
import { Product } from '@/data/products';
import { toast } from '@/hooks/use-toast';
import AdminLayout from './components/AdminLayout';
import { Plus, Tag, Trash2, Edit, X, Image as ImageIcon, FolderPlus } from 'lucide-react';
import { normalizeImageUrl, handleImageError, DEFAULT_PLACEHOLDER_IMAGE } from '@/lib/imageUtils';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  featured: boolean;
  existingImages: string[];
  newImages: File[];
};

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Category management modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock_quantity: 0,
    featured: false,
    existingImages: [],
    newImages: [],
  });

  const getAuthToken = () => localStorage.getItem('jwt_token') || '';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast({ title: "Validation Error", description: "Category name is required", variant: "destructive" });
      return;
    }

    setIsSavingCategory(true);
    try {
      const form = new FormData();
      form.append('name', newCategoryName.trim());
      if (newCategoryDesc) form.append('description', newCategoryDesc.trim());
      if (newCategoryImage) form.append('image', newCategoryImage);

      const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: form,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create category');
      }

      const createdData = await res.json();
      toast({
        title: "Category Created",
        description: `"${newCategoryName}" has been added to categories.`,
      });

      setNewCategoryName('');
      setNewCategoryDesc('');
      setNewCategoryImage(null);
      await fetchCategories();

      // If currently editing product, auto-select this new category
      if (createdData.category?.name) {
        setFormData(prev => ({ ...prev, category: createdData.category.name }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete category');

      toast({
        title: "Category Deleted",
        description: `Category "${name}" was deleted.`,
      });
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setCurrentProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: categories.length > 0 ? categories[0].name : '',
      stock_quantity: 0,
      featured: false,
      existingImages: [],
      newImages: [],
    });
    setIsEditing(true);
  };
  
  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: Number(product.price) || 0,
      category: product.category || (categories.length > 0 ? categories[0].name : ''),
      stock_quantity: product.stock_quantity ?? 0,
      featured: Boolean(product.featured),
      existingImages: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []),
      newImages: [],
    });
    setIsEditing(true);
  };
  
  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = (type: 'existing' | 'new', idx: number) => {
    setFormData((prev) => {
      if (type === 'existing') {
        const updated = [...(prev.existingImages || [])];
        updated.splice(idx, 1);
        return { ...prev, existingImages: updated };
      } else {
        const updated = [...(prev.newImages || [])];
        updated.splice(idx, 1);
        return { ...prev, newImages: updated };
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setFormData((prev) => ({
      ...prev,
      newImages: [...(prev.newImages || []), ...Array.from(files)],
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', String(formData.price));
      form.append('category', formData.category);
      form.append('stock_quantity', String(formData.stock_quantity));
      form.append('featured', formData.featured ? '1' : '0');
      form.append('existingImages', JSON.stringify(formData.existingImages || []));

      if (formData.newImages && formData.newImages.length > 0) {
        for (let img of formData.newImages) {
          form.append('images[]', img);
        }
      }

      let url = `${API_URL}/api/products`;
      if (currentProduct && currentProduct.id) {
        url = `${API_URL}/api/products/${currentProduct.id}`;
        form.append('_method', 'PUT');
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: form,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || (currentProduct ? 'Failed to update product' : 'Failed to add product'));
      }

      toast({
        title: "Success",
        description: currentProduct ? "Product updated successfully" : "Product added successfully",
      });
      setIsEditing(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    }
  };
  
  return (
    <AdminLayout title="Products">
      <div>
        {/* Header Action Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-border">
          <div>
            <h1 className="text-xl font-semibold">Product Inventory</h1>
            <p className="text-sm text-muted-foreground">Manage your store products and categories</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="btn border border-border bg-secondary hover:bg-secondary/80 text-foreground py-2 px-4 flex items-center gap-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Tag size={16} />
              Manage Categories
            </button>
            <button
              onClick={handleAddNew}
              className="btn btn-primary py-2 px-4 flex items-center gap-2 rounded-lg text-sm font-medium"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </div>
        
        {/* Product Edit / Add Form */}
        {isEditing ? (
          <div className="bg-white border border-border rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
              <h2 className="text-xl font-semibold">
                {currentProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Product Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g. Hydrating Glow Serum"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="category" className="block text-sm font-medium">
                        Category *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        <Plus size={12} /> Add New Category
                      </button>
                    </div>
                    {categories.length > 0 ? (
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="category"
                        name="category"
                        type="text"
                        placeholder="e.g. Serums, Cleansers"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-border rounded-lg"
                        required
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium mb-1">
                        Price (Ghs) *
                      </label>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="stock_quantity" className="block text-sm font-medium mb-1">
                        Stock Quantity *
                      </label>
                      <input
                        id="stock_quantity"
                        name="stock_quantity"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.stock_quantity}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Feature this product on homepage</span>
                    </label>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Product Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Write a clear, enticing description of the product..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-border rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Product Images
                    </label>
                    <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary transition-colors">
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label htmlFor="images" className="cursor-pointer flex flex-col items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium text-primary">Click to upload product images</span>
                        <span className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP (Max 5MB each)</span>
                      </label>
                    </div>

                    {/* Image Previews */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.existingImages && formData.existingImages.map((img: string, idx: number) => (
                        <div key={`existing-${idx}`} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border">
                          <img
                            src={normalizeImageUrl(img, DEFAULT_PLACEHOLDER_IMAGE)}
                            alt={`Image ${idx + 1}`}
                            onError={handleImageError}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('existing', idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {formData.newImages && formData.newImages.map((img: File, idx: number) => (
                        <div key={`new-${idx}`} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-primary">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`New image ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('new', idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn border border-border px-5 py-2 rounded-lg text-sm font-medium hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-6 py-2 rounded-lg text-sm font-medium"
                >
                  {currentProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
        
        {/* Products Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 border-b border-border text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No products found. Click "Add Product" above to create your first product.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={normalizeImageUrl(product.image || (Array.isArray(product.images) && product.images[0]), DEFAULT_PLACEHOLDER_IMAGE)}
                            alt={product.name}
                            onError={handleImageError}
                            className="w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0"
                          />
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        Ghs {Number(product.price).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          (product.stock_quantity ?? 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock_quantity ?? 0} in stock
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {product.featured ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800">Featured</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Management Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Manage Product Categories</h3>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleAddNewCategory} className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <FolderPlus size={16} className="text-primary" />
                  Create New Category
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Category Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Body Butter"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full p-2 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Optional Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewCategoryImage(e.target.files ? e.target.files[0] : null)}
                      className="w-full p-1.5 text-xs border border-border rounded-md bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Short description of this category"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    className="w-full p-2 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingCategory}
                    className="btn btn-primary text-xs py-2 px-4 rounded-md font-medium"
                  >
                    {isSavingCategory ? 'Saving...' : 'Add Category'}
                  </button>
                </div>
              </form>

              {/* Existing Categories List */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Existing Categories ({categories.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No categories created yet.</p>
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-secondary/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {cat.image ? (
                            <img
                              src={normalizeImageUrl(cat.image, DEFAULT_PLACEHOLDER_IMAGE)}
                              alt={cat.name}
                              onError={handleImageError}
                              className="w-9 h-9 object-cover rounded-md border border-border"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center text-muted-foreground">
                              <Tag size={16} />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">{cat.name}</p>
                            {cat.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1 text-muted-foreground hover:text-red-600 rounded"
                          title="Delete Category"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="btn border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
