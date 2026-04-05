import { prisma } from "../lib/prisma.js";

// ✅ Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body || {};

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Category name is required",
      });
    }

    // Check duplicate
    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: "Category with this name already exists",
      });
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : "",
      },
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update Category
export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    const categoryId = req.params.id;

    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: Number(categoryId) },
      data: {
        name: name ? name.trim() : category.name,
        description: description ? description.trim() : category.description,
      },
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    await prisma.category.delete({
      where: { id: Number(categoryId) },
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      deletedCategory: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get All Categories
export const getCategories = async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Category by ID
export const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
