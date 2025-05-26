import { useState, useMemo, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Calendar,
  Tag,
  Clock,
  Trash2,
  Edit2,
  Eye,
  Plus,
  X,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import {
  BlogPost,
  BlogPostStatus,
  BlogTheme,
  useAdminStore,
} from "../../store/adminStore";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function BlogManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [theme, setTheme] = useState<BlogTheme>("Technology");
  const [status, setStatus] = useState<BlogPostStatus>("draft");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | "All">(
    "All"
  );
  const [themeFilter, setThemeFilter] = useState<BlogTheme | "All">("All");

  const {
    blogPosts = [],
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    fetchBlogPosts,
    loading,
    error,
  } = useAdminStore();

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "",
  });

  // Filter and sort blog posts
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus =
        statusFilter === "All" || post.status === statusFilter;
      const matchesTheme = themeFilter === "All" || post.theme === themeFilter;
      return matchesSearch && matchesStatus && matchesTheme;
    });
  }, [blogPosts, searchTerm, statusFilter, themeFilter]);

  // const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     try {
  //       const path = `blog-images/${crypto.randomUUID()}/${file.name}`;
  //       const arrayBuffer = await file.arrayBuffer();
  //       const contentType = file.type;

  //       const { error } = await supabase.storage
  //         .from("images")
  //         .upload(path, arrayBuffer, {
  //           contentType,
  //           upsert: false,
  //         });

  //       if (error) {
  //         console.error("Error uploading image:", error.message);
  //         return;
  //       }

  //       const publicUrl = supabase.storage.from("images").getPublicUrl(path)
  //         .data?.publicUrl;
  //       if (publicUrl) {
  //         setImages([publicUrl]); // Save the public URL in the `images` field
  //       }
  //     } catch (err) {
  //       console.error("Unexpected error uploading image:", err);
  //     }
  //   }
  // };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const resetForm = () => {
    setTitle("");
    setImages([""]);
    setTheme("Technology");
    setStatus("draft");
    setTags([]);
    editor?.commands.setContent("");
    setSelectedPost(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!title || !editor?.getHTML()) return;

    let uploadedImages = images;

    // Trigger image upload if a new image is selected
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];
    if (file) {
      try {
        const path = `blog-images/${crypto.randomUUID()}/${file.name}`;
        const arrayBuffer = await file.arrayBuffer();
        const contentType = file.type;

        // Upload the image to Supabase storage
        const { error } = await supabase.storage
          .from("images")
          .upload(path, arrayBuffer, {
            contentType,
            upsert: false,
          });

        if (error) {
          console.error("Error uploading image:", error.message);
          return;
        }

        // Generate a signed URL for the uploaded image
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("images")
          .createSignedUrl(path, 60 * 60 * 1000000000000);

        if (signedUrlError) {
          console.error("Error generating signed URL:", signedUrlError.message);
          return;
        }

        if (signedUrlData?.signedUrl) {
          uploadedImages = [signedUrlData.signedUrl];
        }
      } catch (err) {
        console.error("Unexpected error uploading image:", err);
        return;
      }
    }

    const post: BlogPost = {
      id: selectedPost?.id || crypto.randomUUID(),
      user_id: "default_user_id",
      title,
      description: editor.getHTML(),
      images: uploadedImages,
      created_at: selectedPost?.created_at || new Date(),
      updated_at: new Date(),
      status,
      theme,
      tags,
      reading_time: calculateReadTime(editor.getHTML()),
    };

    if (selectedPost) {
      updateBlogPost(selectedPost.id, post);
    } else {
      createBlogPost(post);
    }

    resetForm();
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setTitle(post.title);
    setImages(post.images || []);
    setTheme(post.theme);
    setStatus(post.status);
    setTags(post.tags);
    editor?.commands.setContent(post.description);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteBlogPost(id);
    }
  };

  const getStatusColor = (status: BlogPostStatus) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "offline":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {loading && <p className="text-primary">Loading blog posts...</p>}
      {error && <p className="text-red-500 dark:text-red-200">Error: {error}</p>}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Blog Management
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            Create and manage blog posts
          </p>
        </div>
        <button
          onClick={() => {
            console.log("Create button clicked");
            setIsEditing(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4 mr-2 text-white" />
          New Post
        </button>
      </div>

      {!isEditing && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search posts..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as BlogPostStatus | "All")
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
          >
            <option value="All">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="online">Published</option>
            <option value="offline">Offline</option>
            <option value="deleted">Deleted</option>
          </select>

          <select
            value={themeFilter}
            onChange={(e) =>
              setThemeFilter(e.target.value as BlogTheme | "All")
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
          >
            <option value="All">All Themes</option>
            <option value="Technology">Technology</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Business">Business</option>
            <option value="Education">Education</option>
            <option value="Environment">Environment</option>
          </select>
        </div>
      )}

      {isEditing ? (
        <div className="bg-white dark:dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Featured Image
              </label>
              <div className="mt-1 flex items-center">
                <ImageIcon className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="file"
                  accept="image/*"
                  // onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-light file:text-white hover:file:bg-primary-DEFAULT"
                />
              </div>
              {images?.[0] && (
                <img
                  src={images[0]}
                  alt="Featured"
                  className="mt-2 h-32 w-auto object-cover rounded-md"
                />
              )}
            </div>

            <div className="border border-gray-200 rounded-t-md p-2 flex space-x-2">
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-1 rounded ${
                  editor?.isActive("bold") ? "bg-gray-200" : "hover:bg-gray-100"
                }`}
              >
                <Bold className="h-5 w-5" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-1 rounded ${
                  editor?.isActive("italic")
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <Italic className="h-5 w-5" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-1 rounded ${
                  editor?.isActive("bulletList")
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
                className={`p-1 rounded ${
                  editor?.isActive("orderedList")
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <ListOrdered className="h-5 w-5" />
              </button>
            </div>

            <div className="border border-gray-200 rounded-b-md p-4 min-h-[200px]">
              <EditorContent editor={editor} />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="theme"
                  className="block text-sm font-medium text-gray-700"
                >
                  Theme
                </label>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as BlogTheme)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
                >
                  <option value="Technology">Technology</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                  <option value="Environment">Environment</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BlogPostStatus)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
                >
                  <option value="draft">Draft</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700"
              >
                Tags
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="text"
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
                  placeholder="Add a tag"
                />
                <button
                  onClick={handleAddTag}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-DEFAULT hover:bg-primary-dark"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
              >
                {selectedPost ? "Update" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:dark:bg-gray-800 p-4 shadow-sm rounded-lg divide-y divide-gray-200">
          {filteredPosts.map((post) => (
            <div key={post.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {post.images && (
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="h-16 w-16 object-cover rounded-md text-gray-500 dark:text-gray-400"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        {post.title}
                      </h2>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          post.status
                        )}`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-primary" />
                        {format(post.created_at, "MMM dd, yyyy")}
                      </span>
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1 text-primary" />
                        {post.theme}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-primary" />
                        {post.reading_time} min read
                      </span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewPost(post)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewPost && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Post Preview
                </h3>
                <button
                  onClick={() => setPreviewPost(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6 text-primary" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              {previewPost.images && (
                <img
                  src={previewPost.images[0]}
                  alt={previewPost.title}
                  className="w-full h-64 object-cover rounded-lg mb-6 text-gray-500 dark:text-gray-400"
                />
              )}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {previewPost.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                  {format(previewPost.created_at, "MMM dd, yyyy")}
                </span>
                <span className="flex items-center">
                  <Tag className="h-4 w-4 mr-1 text-primary" />
                  {previewPost.theme}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-primary" />
                  {previewPost.reading_time} min read
                </span>
              </div>
              <div
                className="prose max-w-none text-gray-700 dark:text-gray-200"
                dangerouslySetInnerHTML={{ __html: previewPost.description }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
