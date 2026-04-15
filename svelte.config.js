import adapter from '@sveltejs/adapter-vercel';
 
const config = {
  kit: {
    adapter: adapter({
      runtime: 'nodejs24.x'
    })
  }
};
 
export default config;