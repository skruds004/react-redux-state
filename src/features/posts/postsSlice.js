import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit';
import { sub } from 'date-fns';
import { client } from '../../api/client';

// const initialState = [
//   { id: '1', title: 'First Post!', content: 'Hello!', date: sub(new Date(), { minutes: 10 }).toISOString() },
//   { id: '2', title: 'Second Post', content: 'More text', date: sub(new Date(), { minutes: 5 }).toISOString() }
// ]

const initialState = {
      posts: [],
      status: 'idle',
      error: null
}
    
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
      const response = await client.get('/fakeApi/posts')
      return response.data
});
    
export const addNewPost = createAsyncThunk(
      'posts/addNewPost',
      // Payload creator receives partial `{title, content, user}` object
      async initialPost => {
        // We send the initial data to the fake API server
        const response = await client.post('/fakeApi/posts', initialPost)
        // The response includes the complete post, including unique ID
        return response.data
      }
);
    

const postsSlice = createSlice({
      name: 'posts',
      initialState,
      reducers: {
            // postAdded: {
            //       reducer(state, action) {
            //             state.posts.push(action.payload)
            //       },
            //       prepare(title, content, userID) {
            //       return {
            //       payload: {
            //             id: nanoid(),
            //             date: new Date().toISOString(),
            //             title,
            //             content,
            //             user: userID
            //       }
            //       }
            //       }
            // },
            postUpdated(state, action) {
                  const { id, title, content } = action.payload
                  const existingPost = state.posts.find(post => post.id === id)
                  if (existingPost) {
                  existingPost.title = title
                  existingPost.content = content
                  }
            },
            reactionAdded(state, action) {
                  const { postId, reaction } = action.payload
                  const existingPost = state.posts.find(post => post.id === postId)
                  if (existingPost) {
                  existingPost.reactions[reaction]++
                  }
            }
      },
      extraReducers(builder) {
            builder
            .addCase(fetchPosts.pending, (state, action) => {
                  state.status = 'loading'
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                  state.status = 'succeeded'
                  state.posts = state.posts.concat(action.payload)
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                  state.status = 'failed'
                  state.error = action.error.message
            })
            .addCase(addNewPost.fulfilled, (state, action) => {
                  // We can directly add the new post object to our posts array
                  state.posts.push(action.payload)
            })
      }
});

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions;

export default postsSlice.reducer;

export const selectAllPosts = state => state.posts.posts

export const selectPostById = (state, postId) =>
  state.posts.posts.find(post => post.id === postId)