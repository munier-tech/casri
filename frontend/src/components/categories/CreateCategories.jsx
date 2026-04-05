import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, List, Edit, Trash2, X, Tag, Folder } from "lucide-react";
import useCategoryStore from "../../store/useCategoryStore";

const Categories = ({ language = "so" }) => {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editFormData, setEditFormData] = useState({ name: "", description: "" });

  const categoryColors = [
    "from-blue-500 to-purple-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-blue-600",
    "from-teal-500 to-cyan-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500"
  ];

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);

    await createCategory(data);
    if (!error) {
      setFormData({ name: "", description: "" });
      setIsCreating(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", editFormData.name);
    data.append("description", editFormData.description);

    await updateCategory(editingId, data);
    if (!error) {
      cancelEditing();
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditFormData({ name: category.name, description: category.description || "" });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({ name: "", description: "" });
  };

  const cancelCreating = () => {
    setIsCreating(false);
    setFormData({ name: "", description: "" });
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        language === "so"
          ? "Ma hubtaa inaad rabto inaad tirtirto qaybtan?"
          : "Are you sure you want to delete this category?"
      )
    ) {
      await deleteCategory(id);
    }
  };

  const getCategoryColor = (index) => {
    return categoryColors[index % categoryColors.length];
  };

  const content = {
    so: {
      title: "Qaybaha Alaabta",
      createButton: "Abuur Qayb Cusub",
      createTitle: "Abuur Qayb Cusub",
      editTitle: "Wax Ka Beddel Qaybta",
      nameLabel: "Magaca Qaybta",
      descriptionLabel: "Sharaxaad",
      cancel: "Jooji",
      save: "Kaydi",
      delete: "Tirtir",
      edit: "Wax Ka Beddel",
      noCategories: "Ma jiro qaybo la keydiyay",
      loading: "Soo dejineysa qaybaha...",
      error: "Khalad ayaa dhacay",
      existingCategories: "Qaybaha Hadda Jira",
      manageCategories: "Maamul qaybaha alaabtaaga"
    },
    en: {
      title: "Product Categories",
      createButton: "Create New Category",
      createTitle: "Create New Category",
      editTitle: "Edit Category",
      nameLabel: "Category Name",
      descriptionLabel: "Description",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      noCategories: "No categories saved",
      loading: "Loading categories...",
      error: "An error occurred",
      existingCategories: "Existing Categories",
      manageCategories: "Manage your product categories"
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-blue-50">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl mr-4 shadow-lg">
                  <Folder className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{content[language].title}</h2>
                  <p className="text-gray-600 text-lg mt-1">
                    {content[language].manageCategories}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreating(true)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl text-white font-semibold shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                {content[language].createButton}
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center shadow-sm"
              >
                <X className="h-5 w-5 mr-2 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Categories List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {content[language].existingCategories}
                </h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {categories.length} {language === "so" ? "Qayb" : "Categories"}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">{content[language].loading}</p>
                </div>
              ) : categories.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border-2 border-dashed border-gray-200"
                >
                  <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4">
                    <Folder className="h-16 w-16 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-600 text-xl mb-2">{content[language].noCategories}</p>
                  <p className="text-gray-500">
                    {language === "so"
                      ? "Bilow abuurista qayb cusub si aad u billowdo"
                      : "Start by creating a new category to get started"}
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300"
                      whileHover={{ y: -8 }}
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          <div className="flex-shrink-0">
                            <div className={`w-20 h-20 bg-gradient-to-br ${getCategoryColor(index)} rounded-2xl flex items-center justify-center shadow-md border-2 border-white`}>
                              <Tag className="h-8 w-8 text-white" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-lg font-bold text-gray-900 truncate">
                                {category.name}
                              </h4>
                              <div className="flex space-x-1 ml-2">
                                <button
                                  onClick={() => startEditing(category)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200"
                                  title={content[language].edit}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(category.id)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200"
                                  title={content[language].delete}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {category.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {category.description}
                              </p>
                            )}

                            <div className="flex items-center text-xs text-gray-500">
                              <span>
                                {language === "so"
                                  ? `Taariikhda: ${new Date(category.createdAt).toLocaleDateString()}`
                                  : `Created: ${new Date(category.createdAt).toLocaleDateString()}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Create Modal */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{content[language].createTitle}</h3>
                  <button
                    onClick={cancelCreating}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {content[language].nameLabel}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleCreateChange}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={language === "so" ? "Geli magaca qaybta" : "Enter category name"}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {content[language].descriptionLabel}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleCreateChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder={language === "so" ? "Geli sharaxaad (ikhtiyaari)" : "Enter description (optional)"}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={cancelCreating}
                      className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
                    >
                      {content[language].cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all"
                    >
                      {content[language].save}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{content[language].editTitle}</h3>
                  <button
                    onClick={cancelEditing}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {content[language].nameLabel}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {content[language].descriptionLabel}
                    </label>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
                    >
                      {content[language].cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all"
                    >
                      {content[language].save}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Categories;