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
    
    // Use uploaded file path if present, otherwise fall back to URL from body
    let imageValue = req.body.productImage || '';
    if (req.file) {
      imageValue = `/uploads/${req.file.filename}`;
    }
    
    const product = new Product({
      name,
      description,
      price,
      category,
      stockQuantity,
      productImage: imageValue,
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
    
    // Update image: prioritize uploaded file, then URL from body
    if (req.file) {
      product.productImage = `/uploads/${req.file.filename}`;
    } else if (req.body.productImage !== undefined) {
      product.productImage = req.body.productImage;
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
