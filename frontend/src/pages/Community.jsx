import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Heart, 
  MessageCircle, 
  Flag, 
  X, 
  Send,
  Filter,
  TrendingUp,
  Clock
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { 
  getCommunityPosts, 
  createCommunityPost, 
  likeCommunityPost, 
  commentOnPost,
  reportPost 
} from '../services/api'

// Category options for posts
const CATEGORIES = [
  { value: 'all', label: 'All Posts' },
  { value: 'support', label: 'Support' },
  { value: 'advice', label: 'Advice' },
  { value: 'resources', label: 'Resources' },
  { value: 'healing', label: 'Healing' },
  { value: 'legal', label: 'Legal' },
  { value: 'general', label: 'General' }
]

/**
 * NewPostModal Component
 * Modal form for creating a new community post
 */
function NewPostModal({ isOpen, onClose, onSubmit, anonymousId }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [name, setName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    try {
      console.log('Creating post with data:', {
        title: title.trim(),
        content: content.trim(),
        category,
        userId: isAnonymous ? null : anonymousId,
        name: isAnonymous ? null : (name.trim() || null)
      })
      const result = await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
        userId: isAnonymous ? null : anonymousId,
        name: isAnonymous ? null : (name.trim() || null)
      })
      console.log('Post created successfully:', result)
      // Reset form
      setTitle('')
      setContent('')
      setCategory('general')
      setName('')
      setIsAnonymous(true)
      onClose()
    } catch (error) {
      console.error('Error creating post:', error)
      console.error('Error details:', error.response?.data || error.message)
      alert('Failed to create post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-background-dark rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-background-dark border-b border-primary-light p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-heading font-bold text-text-main dark:text-white">
              Create New Post
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-primary/20 transition-colors"
            >
              <X className="w-5 h-5 text-text-main dark:text-white" />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Anonymous toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-primary rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="anonymous" className="text-sm font-body text-text-secondary dark:text-white/80">
                Post anonymously
              </label>
            </div>

            {/* Name field (if not anonymous) */}
            {!isAnonymous && (
              <div>
                <label className="block text-sm font-body font-semibold text-text-main dark:text-white mb-2">
                  Display Name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                  className="w-full px-4 py-2 border border-primary-light rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-background-dark text-text-main dark:text-white"
                />
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-body font-semibold text-text-main dark:text-white mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-primary-light rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-background-dark text-text-main dark:text-white"
              >
                {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-body font-semibold text-text-main dark:text-white mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                maxLength={200}
                required
                className="w-full px-4 py-2 border border-primary-light rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-background-dark text-text-main dark:text-white"
              />
              <p className="text-xs text-text-secondary dark:text-white/60 mt-1">
                {title.length}/200 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-body font-semibold text-text-main dark:text-white mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, experiences, or ask for support..."
                rows={6}
                maxLength={5000}
                required
                className="w-full px-4 py-2 border border-primary-light rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-background-dark text-text-main dark:text-white resize-none"
              />
              <p className="text-xs text-text-secondary dark:text-white/60 mt-1">
                {content.length}/5000 characters
              </p>
            </div>

            {/* Submit button */}
            <div className="flex justify-end space-x-3 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-2 rounded-xl border border-primary-light text-text-main dark:text-white hover:bg-background-light dark:hover:bg-primary/20 transition-colors font-body font-semibold"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading || !title.trim() || !content.trim()}
                className="px-6 py-2 rounded-xl bg-primary text-white font-body font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Post</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * CommentList Component
 * Displays comments for a post with ability to add new comments
 */
function CommentList({ postId, comments, onAddComment, anonymousId }) {
  const [showInput, setShowInput] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [name, setName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setLoading(true)
    try {
      await onAddComment(postId, {
        content: commentText.trim(),
        userId: isAnonymous ? null : anonymousId,
        name: isAnonymous ? null : (name.trim() || null)
      })
      setCommentText('')
      setName('')
      setIsAnonymous(true)
      setShowInput(false)
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Comments list */}
      {comments && comments.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.map((comment, index) => (
            <motion.div
              key={comment._id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background-light dark:bg-primary/10 rounded-xl p-3"
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-sm font-body font-semibold text-text-main dark:text-white">
                  {comment.name || 'Anonymous'}
                </span>
                <span className="text-xs text-text-secondary dark:text-white/60">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm font-body text-text-secondary dark:text-white/80">
                {comment.content}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add comment button/input */}
      {!showInput ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowInput(true)}
          className="w-full text-left px-4 py-2 border border-primary-light rounded-xl hover:bg-background-light dark:hover:bg-primary/20 transition-colors text-sm font-body text-text-secondary dark:text-white/80 flex items-center space-x-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Add a comment...</span>
        </motion.button>
      ) : (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSubmit}
          className="space-y-2"
        >
          {/* Anonymous toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`anonymous-comment-${postId}`}
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-3 h-3 text-primary rounded focus:ring-primary"
            />
            <label htmlFor={`anonymous-comment-${postId}`} className="text-xs font-body text-text-secondary dark:text-white/60">
              Comment anonymously
            </label>
          </div>

          {/* Name field (if not anonymous) */}
          {!isAnonymous && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={50}
              className="w-full px-3 py-2 text-sm border border-primary-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-background-dark text-text-main dark:text-white"
            />
          )}

          {/* Comment input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              maxLength={1000}
              className="flex-1 px-3 py-2 text-sm border border-primary-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-background-dark text-text-main dark:text-white"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || !commentText.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowInput(false)
                setCommentText('')
                setName('')
                setIsAnonymous(true)
              }}
              className="px-4 py-2 rounded-lg border border-primary-light text-text-main dark:text-white hover:bg-background-light dark:hover:bg-primary/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.form>
      )}
    </div>
  )
}

/**
 * CommunityPostCard Component
 * Displays a single post with like, comment, and report functionality
 */
function CommunityPostCard({ post, onLike, onComment, onReport, anonymousId }) {
  const [showComments, setShowComments] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes || 0)

  useEffect(() => {
    // Check if user has liked this post
    if (anonymousId && post.likedBy && post.likedBy.includes(anonymousId)) {
      setIsLiked(true)
    }
    setLikesCount(post.likes || 0)
  }, [post, anonymousId])

  const handleLike = async () => {
    try {
      const result = await onLike(post._id, anonymousId)
      setIsLiked(result.liked)
      setLikesCount(result.likes)
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleReport = async () => {
    if (window.confirm('Are you sure you want to report this post? Our team will review it.')) {
      try {
        await onReport(post._id, anonymousId)
        alert('Thank you for reporting. Our team will review this post.')
      } catch (error) {
        console.error('Error reporting post:', error)
        alert('Failed to report post. Please try again.')
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getCategoryColor = (category) => {
    const colors = {
      support: 'bg-primary/20 text-primary',
      advice: 'bg-accent/20 text-accent',
      resources: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      healing: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      legal: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      general: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
    }
    return colors[category] || colors.general
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-background-dark border border-primary-light rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg font-heading font-bold text-text-main dark:text-white">
              {post.name || 'Anonymous'}
            </span>
            {post.category && (
              <span className={`px-2 py-1 rounded-lg text-xs font-body font-semibold ${getCategoryColor(post.category)}`}>
                {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-text-secondary dark:text-white/60">
            <Clock className="w-3 h-3" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-heading font-bold text-text-main dark:text-white mb-2">
        {post.title}
      </h3>

      {/* Content */}
      <p className="text-base font-body text-text-secondary dark:text-white/80 leading-relaxed mb-4 whitespace-pre-wrap break-words">
        {post.content}
      </p>

      {/* Actions */}
      <div className="flex items-center space-x-4 pt-4 border-t border-primary-light">
        {/* Like button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLike}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
            isLiked
              ? 'bg-primary/20 text-primary'
              : 'hover:bg-background-light dark:hover:bg-primary/20 text-text-secondary dark:text-white/80'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-body font-semibold">{likesCount}</span>
        </motion.button>

        {/* Comment button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-background-light dark:hover:bg-primary/20 text-text-secondary dark:text-white/80 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-body font-semibold">
            {post.comments?.length || 0}
          </span>
        </motion.button>

        {/* Report button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReport}
          className="ml-auto flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
          title="Report this post"
        >
          <Flag className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Comments section */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          <CommentList
            postId={post._id}
            comments={post.comments || []}
            onAddComment={onComment}
            anonymousId={anonymousId}
          />
        </motion.div>
      )}
    </motion.div>
  )
}

/**
 * CommunityFeed Component
 * Main component that displays all posts in a feed
 */
function CommunityFeed({ posts, onLike, onComment, onReport, anonymousId, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg font-body text-text-secondary dark:text-white/80">Loading posts...</p>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 bg-white/90 dark:bg-background-dark border border-primary-light rounded-2xl shadow-lg"
      >
        <Users className="w-16 h-16 text-text-secondary dark:text-white/60 mx-auto mb-4" />
        <h3 className="text-xl font-heading font-bold text-text-main dark:text-white mb-2">
          No posts yet
        </h3>
        <p className="text-lg font-body text-text-secondary dark:text-white/80">
          Be the first to share and start the conversation!
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-full">
      {posts.map((post) => (
        <CommunityPostCard
          key={post._id}
          post={post}
          onLike={onLike}
          onComment={onComment}
          onReport={onReport}
          anonymousId={anonymousId}
        />
      ))}
    </div>
  )
}

/**
 * Main Community Page Component
 * Integrates all components and handles API calls
 */
export default function Community() {
  const { anonymousId } = useApp()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')

  // Fetch posts
  const fetchPosts = async () => {
    setLoading(true)
    try {
      // Build params object - only include category if it's not 'all'
      const params = {
        sort,
        limit: 50
      }
      if (category && category !== 'all') {
        params.category = category
      }
      
      console.log('Fetching posts with params:', params)
      const response = await getCommunityPosts(params)
      console.log('Posts response:', response)
      
      if (response.success) {
        setPosts(response.posts || [])
        console.log('Posts set:', response.posts?.length || 0)
      } else {
        console.error('Failed to fetch posts:', response.error)
        setPosts([])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      console.error('Error details:', error.response?.data || error.message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [category, sort])

  // Handle creating a new post
  const handleCreatePost = async (postData) => {
    try {
      console.log('Creating post:', postData)
      const response = await createCommunityPost(postData)
      console.log('Create post response:', response)
      if (response.success) {
        // Refresh posts immediately
        await fetchPosts()
        return response
      } else {
        throw new Error(response.error || 'Failed to create post')
      }
    } catch (error) {
      console.error('Error in handleCreatePost:', error)
      throw error
    }
  }

  // Handle liking a post
  const handleLike = async (postId, userId) => {
    try {
      const response = await likeCommunityPost(postId, userId)
      if (response.success) {
        // Update local state
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, likes: response.likes, likedBy: response.liked ? [...(post.likedBy || []), userId] : (post.likedBy || []).filter(id => id !== userId) }
            : post
        ))
        return response
      }
    } catch (error) {
      throw error
    }
  }

  // Handle adding a comment
  const handleComment = async (postId, commentData) => {
    try {
      const response = await commentOnPost(postId, commentData)
      if (response.success) {
        // Refresh posts to get updated comments
        await fetchPosts()
      }
    } catch (error) {
      throw error
    }
  }

  // Handle reporting a post
  const handleReport = async (postId, userId) => {
    try {
      const response = await reportPost(postId, userId)
      return response
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden box-border space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-main dark:text-white mb-2">
            Community & Support
          </h1>
          <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-white/80">
            Connect with others, share experiences, and find strength together
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewPostModal(true)}
          className="px-6 py-3 rounded-xl bg-primary text-white font-body font-semibold hover:bg-primary-dark transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>New Post</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white/90 dark:bg-background-dark border border-primary-light rounded-2xl shadow-lg">
        {/* Category filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-text-secondary dark:text-white/60" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-primary-light rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-background-dark text-text-main dark:text-white font-body"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort filter */}
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-text-secondary dark:text-white/60" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 border border-primary-light rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-background-dark text-text-main dark:text-white font-body"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Posts Feed */}
      <CommunityFeed
        posts={posts}
        onLike={handleLike}
        onComment={handleComment}
        onReport={handleReport}
        anonymousId={anonymousId}
        loading={loading}
      />

      {/* New Post Modal */}
      <NewPostModal
        isOpen={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
        onSubmit={handleCreatePost}
        anonymousId={anonymousId}
      />
    </div>
  )
}
