import Product from '../models/product.model.js';

export async function getProducts(req, res) {
  try {
    const { search, category, material, capacity, sort } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (material && material !== 'All') {
      query.material = material;
    }

    if (capacity && capacity !== 'All') {
      query.capacity = capacity;
    }

    let sortOption = { createdAt: -1 }; // newest by default
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    }

    const products = await Product.find(query).sort(sortOption);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
}

export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product', error: error.message });
  }
}

export async function createProduct(req, res) {
  try {
    const { name, description, price, category, stockQuantity, brand, capacity, material, availabilityStatus } = req.body;
    
    let images = [];
    
    // 1. Add Cloudinary URLs if any files were uploaded
    if (req.cloudinaryUrls && req.cloudinaryUrls.length > 0) {
      images = [...req.cloudinaryUrls];
    }
    
    // 2. Add URLs sent via the productImages body field
    if (req.body.productImages) {
      try {
        const parsed = typeof req.body.productImages === 'string'
          ? JSON.parse(req.body.productImages)
          : req.body.productImages;
        if (Array.isArray(parsed)) {
          images = [...images, ...parsed];
        } else if (typeof parsed === 'string') {
          images.push(parsed);
        }
      } catch (e) {
        // If not JSON, try parsing as a comma-separated list
        if (typeof req.body.productImages === 'string') {
          const splitUrls = req.body.productImages.split(',').map(u => u.trim()).filter(Boolean);
          images = [...images, ...splitUrls];
        }
      }
    }
    
    // Fallback/compatibility check for single productImage field
    if (req.body.productImage) {
      images.push(req.body.productImage);
    }
    if (req.file && req.file.cloudinaryUrl) {
      images.push(req.file.cloudinaryUrl);
    }
    
    // Clean and de-duplicate the list of image URLs
    images = [...new Set(images.filter(Boolean))];
    
    // Assign primary image (productImage) to the first image or fallback default
    const primaryImage = images[0] || 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600';
    if (images.length === 0) {
      images.push(primaryImage);
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stockQuantity,
      productImage: primaryImage,
      productImages: images,
      brand,
      capacity,
      material,
      availabilityStatus: availabilityStatus || (stockQuantity > 0 ? 'In Stock' : 'Out of Stock')
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { name, description, price, category, stockQuantity, brand, capacity, material, availabilityStatus } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.name = name !== undefined ? name : product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.category = category !== undefined ? category : product.category;
    product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
    product.brand = brand !== undefined ? brand : product.brand;
    product.capacity = capacity !== undefined ? capacity : product.capacity;
    product.material = material !== undefined ? material : product.material;
    
    // Manage product images array
    let images = [];
    
    // 1. Gather existing images / text-input images from body
    if (req.body.productImages !== undefined) {
      try {
        const parsed = typeof req.body.productImages === 'string'
          ? JSON.parse(req.body.productImages)
          : req.body.productImages;
        if (Array.isArray(parsed)) {
          images = [...parsed];
        } else if (typeof parsed === 'string') {
          images = parsed.split(',').map(u => u.trim()).filter(Boolean);
        }
      } catch (e) {
        if (typeof req.body.productImages === 'string') {
          images = req.body.productImages.split(',').map(u => u.trim()).filter(Boolean);
        }
      }
    } else {
      // If productImages wasn't sent, keep the existing product images
      images = product.productImages && product.productImages.length > 0 ? [...product.productImages] : [product.productImage];
    }
    
    // 2. Append new Cloudinary uploaded files
    if (req.cloudinaryUrls && req.cloudinaryUrls.length > 0) {
      images = [...images, ...req.cloudinaryUrls];
    }
    
    // De-duplicate and filter
    images = [...new Set(images.filter(Boolean))];
    
    if (images.length > 0) {
      product.productImages = images;
      product.productImage = images[0];
    } else if (req.body.productImage !== undefined) {
      // Fallback compatibility with single productImage
      product.productImage = req.body.productImage;
      product.productImages = [req.body.productImage];
    }
    
    if (stockQuantity !== undefined) {
      product.availabilityStatus = stockQuantity > 0 ? 'In Stock' : 'Out of Stock';
    } else if (availabilityStatus !== undefined) {
      product.availabilityStatus = availabilityStatus;
    }
    
    await product.save();
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
}
