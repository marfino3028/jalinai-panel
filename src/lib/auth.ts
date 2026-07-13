import { reactive } from 'vue';

const KEY = 'jalinai_admin_token';

export const auth = reactive({
  token: localStorage.getItem(KEY) ?? '',
  get isLoggedIn(): boolean {
    return this.token.length > 0;
  },
  login(token: string): void {
    this.token = token;
    localStorage.setItem(KEY, token);
  },
  logout(): void {
    this.token = '';
    localStorage.removeItem(KEY);
  },
});
