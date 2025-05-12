
import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '../../lib/supabase';
import AdminLayout from './components/AdminLayout';
import { Database } from '../../types/supabase';

type Product = Database['public']['Tables']['products']['Row'];

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    how_to_use: '',
    benefits: [] as string[],
    ingredients: [] as string[],
    stock_quantity: 0,
    featured: false,
  });
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
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
      price: 0,
      image: '',
      category: '',
      how_to_use: '',
      benefits: [],
      ingredients: [],
      stock_quantity: 0,
      featured: false,
    });
    setIsEditing(true);
  };
  
  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      how_to_use: product.how_to_use,
      benefits: product.benefits || [],
      ingredients: product.ingredients || [],
      stock_quantity: product.stock_quantity,
      featured: product.featured,
    });
    setIsEditing(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
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
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'price') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else if (name === 'stock_quantity') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleArrayChange = (name: 'benefits' | 'ingredients', value: string) => {
    const array = value.split('\n').filter(item => item.trim() !== '');
    setFormData({ ...formData, [name]: array });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (currentProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image: formData.image,
            category: formData.category,
            how_to_use: formData.how_to_use,
            benefits: formData.benefits,
            ingredients: formData.ingredients,
            stock_quantity: formData.stock_quantity,
            featured: formData.featured,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentProduct.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Add new product
        const { error } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image: formData.image,
            category: formData.category,
            how_to_use: formData.how_to_use,
            benefits: formData.benefits,
            ingredients: formData.ingredients,
            stock_quantity: formData.stock_quantity,
            featured: formData.featured,
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      
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
                    Price ($)*
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
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
                  </select>
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
                  <label htmlFor="image" className="block text-sm font-medium mb-1">
                    Image URL*
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="text"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-border rounded-md"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="featured"
                    name="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Featured Product
                  </label>
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
                  <label htmlFor="benefits" className="block text-sm font-medium mb-1">
                    Benefits (one per line)
                  </label>
                  <textarea
                    id="benefits"
                    name="benefits"
                    value={formData.benefits.join('\n')}
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
                    value={formData.ingredients.join('\n')}
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
      ) : (
        <div className="bg-white border border-border rounded-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <p>Loading products...</p>
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
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ${product.price.toFixed(2)}
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
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
