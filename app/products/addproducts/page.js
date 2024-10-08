"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/config/index";
import { useRouter } from 'next/navigation';
const AddProducts = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [price, setPrice] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [previewImages, setPreviewImages] = useState([]); // New state for image previews
  const router = useRouter();
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        if (Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          throw new Error("Categories data is not an array");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Could not load categories");
      }
    };

    fetchCategories();
  }, []);

  // Handle file selection and generate previews
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selectedFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    setIsUploading(true);

    try {
      const selectedCategory = categories.find((cat) => cat.title === category);

      if (!selectedCategory) {
        throw new Error("Invalid category selected.");
      }

      const productResponse = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            title,
            description,
            categories: [selectedCategory.id],
            price,
          },
        }),
      });

      if (!productResponse.ok) {
        const errorData = await productResponse.json();
        throw new Error(errorData.error.message || "Failed to create product");
      }

      const productData = await productResponse.json();
      const productId = productData.data.id;

      if (!productId) {
        throw new Error("Product ID not found in response");
      }

      // Upload the images
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("ref", "api::product.product");
      formData.append("refId", productId);
      formData.append("field", "images");

      const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(uploadError.error.message || "Failed to upload images");
      }

      const uploadData = await uploadResponse.json();
      console.log("Upload response data:", uploadData);
        
      setMessage("Product and images uploaded successfully!");
      router.push(`editproduct/${productId}`);
      setError("");
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "There was an error processing your request.");
      setMessage("");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="container bg-light col-md-6"
      style={{ marginTop: "10%", padding: "35px" }}
    >
      <h3 className="text-center text-primary">Add Products</h3>
      <div className="text-danger">{error}</div>
      <div className="text-success">{message}</div>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            className="form-control mb-2"
            name="title"
            placeholder="Title"
            id="name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="description">Product Description</label>
          <textarea
            type="text"
            className="form-control mb-2"
            name="description"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="category">Category</label>
          <select
            id="categories"
            name="categories"
            className="form-control mb-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">--Please choose a category--</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.title}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="text"
            className="form-control mb-2"
            name="price"
            placeholder="Price"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="images">Upload Images</label>
          <input
            type="file"
            className="form-control mb-2"
            name="images"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </div>
        <div>
          <div className="image-preview-container">
            {previewImages.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`Preview ${index}`}
                style={{ width: "100px", marginRight: "10px" }}
              />
            ))}
          </div>
        </div>
        <input
          type="submit"
          value={isUploading ? "Uploading..." : "Add Product"}
          className="btn btn-primary mt-3"
          disabled={isUploading}
        />
      </form>
    </div>
  );
};

export default AddProducts;
