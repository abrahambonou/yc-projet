import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageCircle, 
  Heart, 
  Clock, 
  User,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { authService } from '../services/authService';

const Forum = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);

  const categories = [
    { id: 'all', name: 'Toutes les catégories', color: 'bg-gray-100 text-gray-700' },
    { id: 'general', name: 'Général', color: 'bg-blue-100 text-blue-700' },
    { id: 'programming', name: 'Programmation', color: 'bg-green-100 text-green-700' },
    { id: 'design', name: 'Design', color: 'bg-purple-100 text-purple-700' },
    { id: 'career', name: 'Carrière', color: 'bg-orange-100 text-orange-700' },
    { id: 'resources', name: 'Ressources', color: 'bg-pink-100 text-pink-700' },
    { id: 'help', name: 'Aide', color: 'bg-red-100 text-red-700' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      const category = selectedCategory === 'all' ? null : selectedCategory;
      const data = await authService.getForumPosts(category, 50);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData) => {
    try {
      const newPost = await authService.createForumPost(postData);
      setPosts([newPost, ...posts]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const toggleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forum Communauté</h1>
          <p className="text-gray-600 mt-1">Échangez avec d'autres apprenants</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary mt-4 md:mt-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle discussion
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans le forum..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id 
                ? category.color 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucune discussion'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Essayez de modifier votre recherche'
                : 'Soyez le premier à lancer une discussion !'
              }
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle discussion
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <ForumPost
              key={post.id}
              post={post}
              isExpanded={expandedPost === post.id}
              onToggleExpand={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              onLike={() => toggleLike(post.id)}
              getCategoryInfo={getCategoryInfo}
            />
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateForm && (
        <CreatePostModal
          onClose={() => setShowCreateForm(false)}
          onCreate={createPost}
          categories={categories.slice(1)} // Remove 'all' category
        />
      )}
    </div>
  );
};

// Forum Post Component
const ForumPost = ({ post, isExpanded, onToggleExpand, onLike, getCategoryInfo }) => {
  const [replyText, setReplyText] = useState('');
  const categoryInfo = getCategoryInfo(post.category);

  const handleReply = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      // Here you would typically send the reply to the backend
      console.log('Reply:', replyText);
      setReplyText('');
    }
  };

  return (
    <div className="forum-post">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900">{post.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
              {categoryInfo.name}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <span>Par {post.author_name}</span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="text-gray-700 mb-4">
            {isExpanded ? post.content : `${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}`}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onLike}
              className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>{post.likes}</span>
            </button>
            
            <button
              onClick={onToggleExpand}
              className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Répondre</span>
            </button>
            
            {post.content.length > 200 && (
              <button
                onClick={onToggleExpand}
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Réduire</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Voir plus</span>
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* Reply Form */}
          {isExpanded && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <form onSubmit={handleReply} className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  className="input-field resize-none"
                  rows="3"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="btn-primary text-sm"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Répondre
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Post Modal Component
const CreatePostModal = ({ onClose, onCreate, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: categories[0]?.id || 'general'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Nouvelle discussion</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="input-field"
              placeholder="Sujet de votre discussion"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="input-field"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="input-field resize-none"
              rows="6"
              placeholder="Décrivez votre question ou sujet de discussion..."
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              Publier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Forum;