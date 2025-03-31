import { mount } from '@vue/test-utils';
import Login from '../Login.vue';

describe('Login.vue', () => {
  it('renders login form', () => {
    const wrapper = mount(Login);
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
  });

  it('validates form inputs', async () => {
    const wrapper = mount(Login);
    await wrapper.find('button').trigger('click');
    expect(wrapper.vm.usernameError).toBe('用户名不能为空');
    expect(wrapper.vm.passwordError).toBe('密码不能为空');
  });
}); 