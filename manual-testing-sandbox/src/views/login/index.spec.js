import { mount } from '@vue/test-utils'
import Login from '@/views/login/index.vue'
import axios from 'axios'

// 模拟axios请求
jest.mock('axios')

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the login form correctly', () => {
    const wrapper = mount(Login)
    
    // 检查表单是否存在
    expect(wrapper.find('.el-form').exists()).toBe(true)
    expect(wrapper.find('.el-input').length).toBe(2) // 用户名和密码输入框
    expect(wrapper.find('.el-button').length).toBe(2) // 登录和重置按钮
  })

  it('should call login API when clicking the login button', () => {
    const wrapper = mount(Login)
    
    // 模拟表单填写
    wrapper.setData({
      form: {
        username: 'test',
        password: '123456'
      }
    })
    
    // 触发登录按钮点击事件
    const loginButton = wrapper.find('.el-button--primary')
    loginButton.trigger('click')

    // 验证axios.post被调用
    expect(axios.post).toHaveBeenCalled()
    expect(axios.post).toHaveBeenCalledWith('/api/login', {
      username: 'test',
      password: '123456'
    })
  })

  it('should reset the form when clicking the reset button', () => {
    const wrapper = mount(Login)
    
    // 模拟表单填写
    wrapper.setData({
      form: {
        username: 'test',
        password: '123456'
      }
    })
    
    // 触发重置按钮点击事件
    const resetButton = wrapper.find('.el-button--default')
    resetButton.trigger('click')

    // 验证表单数据是否重置
    expect(wrapper.vm.form.username).toBe('')
    expect(wrapper.vm.form.password).toBe('')
  })
})
