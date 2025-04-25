import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../lib/axios';

// Async thunks
export const createPost = createAsyncThunk(
    'posts/createPost',
    async (postData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/posts/create', postData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createComment = createAsyncThunk(
    'posts/createComment',
    async ({ postId, content }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/posts/${postId}/comments`, {
                content
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/posts');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    posts: [],
    status: 'idle',
    error: null,
    moderationStatus: null
};

const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setModerationStatus: (state, action) => {
            state.moderationStatus = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Post
            .addCase(createPost.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts.unshift(action.payload);
            })
            .addCase(createPost.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Create Comment
            .addCase(createComment.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const post = state.posts.find(p => p._id === action.payload.postId);
                if (post) {
                    post.comments.push(action.payload.comment);
                }
            })
            .addCase(createComment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Fetch Posts
            .addCase(fetchPosts.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = action.payload;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { clearError, setModerationStatus } = postSlice.actions;
export default postSlice.reducer; 