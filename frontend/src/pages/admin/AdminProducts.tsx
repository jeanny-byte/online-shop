import React, { useEffect, useState } from 'react';
import { Product } from '@/data/products';

// Use API URL from .env
const API_URL = import.meta.env.VITE_API_URL;
import { toast } from '@/hooks/use-toast';
import AdminLayout from './components/AdminLayout';

// Define a type for the form data, which is slightly different from the Product type
type ProductFormData = Omit<Product, 'id' | 'image' | 'images'> & {
  existingImages: string[];
  newImages: File[];
  brands: string;
};

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    brands: '',
    price: 0,
    existingImages: [], // URLs of images already in DB
    newImages: [],      // Files newly added
    category: '',
    how_to_use: '',
    benefits: [],
    ingredients: [],
    stock_quantity: 0,
    featured: false,
    best_seller: false,
  });

  // Utility to ensure array fields are always arrays
  const normalizeArrayField = (field: any) => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') return field.split('\n').filter((item: string) => item.trim() !== '');
    return [];
  };

  // Remove image handler
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

  // Handle image uploads and store File objects
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setFormData((prev) => ({
      ...prev,
      newImages: [...(prev.newImages || []), ...Array.from(files)],
    }));
  };

  useEffect(() => {
    fetchProducts();
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
        description: "Failed to load products. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddNew = () => {
    setCurrentProduct(null);
    setFormData({
      name: '',
      description: '',
      brands: '',
      price: 0,
      existingImages: [],
      newImages: [],
      category: '',
      how_to_use: '',
      benefits: [],
      ingredients: [],
      stock_quantity: 0,
      featured: false,
      best_seller: false,
    });
    setIsEditing(true);
  };
  
  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      brands: product.brands,
      price: product.price,
      existingImages: Array.isArray(product.images) ? product.images : [],
      newImages: [],
      category: product.category,
      how_to_use: product.how_to_use,
      benefits: normalizeArrayField(product.benefits),
      ingredients: normalizeArrayField(product.ingredients),
      stock_quantity: product.stock_quantity,
      featured: product.featured || false,
      best_seller: product.best_seller || false,
    });
    setIsEditing(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (name: 'benefits' | 'ingredients', value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value.split('\n') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('brands', formData.brands);
      form.append('price', String(formData.price));
      form.append('category', formData.category);
      form.append('how_to_use', formData.how_to_use);
      form.append('stock_quantity', String(formData.stock_quantity));
      form.append('featured', formData.featured ? '1' : '0');
      form.append('best_seller', formData.best_seller ? '1' : '0');
      form.append('benefits', Array.isArray(formData.benefits) ? formData.benefits.join('\n') : formData.benefits);
      form.append('ingredients', Array.isArray(formData.ingredients) ? formData.ingredients.join(', ') : formData.ingredients);
      // Send URLs of images to keep
      form.append('existingImages', JSON.stringify(formData.existingImages || []));
      // Send new files
      if (formData.newImages && formData.newImages.length > 0) {
        for (let img of formData.newImages) {
          form.append('images[]', img);
        }
      }
      // If editing, include the product id for update
      let url = `${API_URL}/api/products`;
      let method = 'POST';

      if (currentProduct && currentProduct.id) {
        url = `${API_URL}/api/products/${currentProduct.id}`;
        form.append('_method', 'PUT'); // Laravel requirement for multipart PUT requests
      }
      
      const token = localStorage.getItem('jwt_token');

      const res = await fetch(url, {
        method: method,
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: form,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Validation errors:', errData);
        throw new Error(currentProduct ? 'Failed to update product' : 'Failed to add product');
      }
      toast({
        title: "Success",
        description: currentProduct ? "Product updated successfully" : "Product added successfully",
      });
      setIsEditing(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };
  
  return (
    <AdminLayout title="Products">
      <div>
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            Manage your product inventory
          </p>
          <button
            onClick={handleAddNew}
            className="btn btn-primary py-2 px-4"
          >
            Add New Product
          </button>
        </div>
        
        {isEditing ? (
          <div className="bg-white border border-border rounded-md p-6">
            <h2 className="text-xl font-medium mb-6">
              {currentProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Product Name*
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-1">
                      Price (Ghs)*
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="1"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">
                      Category*
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-border rounded-md"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="cleanser">Cleanser</option>
                      <option value="moisturizer">Moisturizer</option>
                      <option value="serum">Serum</option>
                      <option value="mask">Mask</option>
                      <option value="sunscreen">Sunscreen</option>
                      <option value="toner">Toner</option>
                      <option value="eye cream">Eye Cream</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="how_to_use" className="block text-sm font-medium mb-1">
                      How to Use*
                    </label>
                    <textarea
                      id="how_to_use"
                      name="how_to_use"
                      value={formData.how_to_use}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-border rounded-md h-24"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="brands" className="block text-sm font-medium mb-1">
                      Brands*
                    </label>
                    <input
                      id="brands"
                      name="brands"
                      type="text"
                      value={formData.brands}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="stock_quantity" className="block text-sm font-medium mb-1">
                      Stock Quantity*
                    </label>
                    <input
                      id="stock_quantity"
                      name="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="images" className="block text-sm font-medium mb-1">
                      Upload Images*
                    </label>
                    <input
                      id="images"
                      name="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full p-2 border border-border rounded-md"
                      required={!currentProduct}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {formData.existingImages && formData.existingImages.map((img: string, idx: number) => (
                        <div key={`existing-${idx}`} style={{ position: 'relative' }}>
                          <img
                            src={img}
                            alt={`Existing image ${idx + 1}`}
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('existing', idx)}
                            style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer' }}
                            title="Remove"
                          >×</button>
                        </div>
                      ))}
                      {formData.newImages && formData.newImages.map((img: File, idx: number) => (
                        <div key={`new-${idx}`} style={{ position: 'relative' }}>
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Preview new ${idx + 1}`}
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('new', idx)}
                            style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer' }}
                            title="Remove"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  </div>
  
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Description*
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-border rounded-md h-24"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="benefits" className="block text-sm font-medium mb-1">
                      Benefits (one per line)
                    </label>
                    <textarea
                      id="benefits"
                      name="benefits"
                      value={Array.isArray(formData.benefits) ? formData.benefits.join('\n') : ''}
                      onChange={(e) => handleArrayChange('benefits', e.target.value)}
                      className="w-full p-2 border border-border rounded-md h-24"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="ingredients" className="block text-sm font-medium mb-1">
                      Ingredients (one per line)
                    </label>
                    <textarea
                      id="ingredients"
                      name="ingredients"
                      value={Array.isArray(formData.ingredients) ? formData.ingredients.join('\n') : ''}
                      onChange={(e) => handleArrayChange('ingredients', e.target.value)}
                      className="w-full p-2 border border-border rounded-md h-24"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary py-2 px-4"
                >
                  {currentProduct ? 'Update Product' : 'Create Product'}
                </button> 
              </div>
            </form>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]} // Use full Cloudinary URL
                          alt={product.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      Ghs{product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {product.stock_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {product.featured ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-primary-foreground hover:underline mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No products found.</p>
            <button
              onClick={handleAddNew}
              className="mt-4 btn btn-primary py-2 px-4"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
