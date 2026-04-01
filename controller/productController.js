import { Product } from "../model/productModel.js";
import cloudinary from "../utils/Cloudinary.js";
import getDataUri from "../utils/datauri.js";

export const addproduct = async (req, res) => {
  try {
    const { productName, productDescription, productPrice, category, brand } =
      req.body;

    const userId = req.id;

    if ((!productName, !productDescription, !productPrice, !category, !brand)) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    let productImage = [];

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const fileUri = getDataUri(file);

        const result = await cloudinary.uploader.upload(fileUri, {
          folder: "e-ecommerce",
        });

        productImage.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }
    const newProduct = await Product.create({
      userId,
      productName,
      productDescription,
      productPrice,
      category,
      brand,
      productImage,
    });

    return res.status(200).json({
      message: "Product Add Successfully",
      success: true,
      product: newProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllProduct = async (_, res) => {
  try {
    const products = await Product.find();
    if (!products) {
      return res.status(404).json({
        success: false,
        message: "No  product Available",
        products: [],
      });
    }
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    //img delete from cloud storage
    if (product.productImage && product.productImage.length > 0) {
      for (let img of product.productImage) {
        const result = await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // delete pro. from db
    await Product.findByIdAndDelete(productId);
    return res
      .status(200)
      .json({ success: true, message: "Product deleted Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      productName,
      productDescription,
      productPrice,
      category,
      brand,
      existingImages,
    } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let updateImages = [];

    if (existingImages) {
      const KeepIds = JSON.parse(existingImages);

      updateImages = product.productImage.filter((img) =>
        KeepIds.includes(img.public_id),
      );

      const removedImages = product.productImage.filter(
        (img) => !KeepIds.includes(img.public_id),
      );

      for (let img of removedImages) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    } else {
      updateImages = product.productImage;
    }

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const fileUri = getDataUri(file);

        const result = await cloudinary.uploader.upload(fileUri.content, {
          folder: "electronic-ecommerce-product",
        });

        updateImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    product.productName = productName || product.productName;
    product.productDescription =
      productDescription || product.productDescription;
    product.productPrice = productPrice || product.productPrice;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.productImage = updateImages;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
