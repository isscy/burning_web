<template>
  <div class="editor-wrapper">
    <div :id="editorId" style="border: 1px solid #ccc;"></div>
    <div id="wangTextId"></div>
  </div>
</template>

<script>
import Editor from 'wangeditor'
import 'wangeditor/release/wangEditor.min.css'
import { oneOf } from '@/libs/tools'
import {getToken} from '@/libs/util'
import baseUrl from '@/libs/baseUrl.js'
export default {
  name: 'Editor',
  props: {
    value: {
      type: String,
      default: ''
    },
    /**
     * 绑定的值的类型, enum: ['html', 'text']
     */
    valueType: {
      type: String,
      default: 'html',
      validator: (val) => {
        return oneOf(val, ['html', 'text'])
      }
    },
    /**
     * @description 设置change事件触发时间间隔
     */
    changeInterval: {
      type: Number,
      default: 200
    },
    /**
     * @description 是否开启本地存储
     */
    cache: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    editorId () {
      return `editor${this._uid}`
    }
  },
  methods: {
    setHtml (val) {
      this.editor.txt.html(val)
    }
  },
  mounted () {
    this.editor = new Editor(`#${this.editorId}`, '#wangTextId')
    this.editor.customConfig.onchange = (html) => {
      let text = this.editor.txt.text()
      if (this.cache) localStorage.editorCache = html
      this.$emit('input', this.valueType === 'html' ? html : text)
      this.$emit('on-change', html, text)
    }
    this.editor.customConfig.onchangeTimeout = this.changeInterval
    /////////////////////////////////////////////////////////////////////// BEGIN add by ff at 20181031 可以上传本地图片  ////////////////////
    document.getElementById(this.editorId).setAttribute('height', '600px');
    this.editor.customConfig.menus = [
        'head',
        'bold',
        'italic',
        'underline',
        'strikeThrough',  // 删除线
        'foreColor',  // 文字颜色
        'backColor',  // 背景颜色
        'link',  // 插入链接
        'emoticon',  // 表情
        'image',  // 插入图片
        'video',  // 插入视频
    ];
    this.editor.customConfig.uploadImgServer = baseUrl + 'upload/oss' 
    this.editor.customConfig.uploadImgMaxSize = 3 * 1024 * 1024
    this.editor.customConfig.uploadImgMaxLength = 1 // 最大上传一张
    this.editor.customConfig.uploadFileName = 'img'  // 长传文件名
    
    this.editor.customConfig.uploadImgHeaders = { // header
        'Authorization': getToken()
    }
    this.editor.customConfig.uploadImgHooks = {
        customInsert: function (insertImg, result, editor) {
            // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果
            console.log(result)
            if(result.code != '1' && result.data == null){
                alert("错误！" + result.message)
            }else{
                var url = result.data.url
                insertImg(url)
            }
        }
    }
    /////////////////////////////////////////////////////////////////////// END  /////////////////////////////////////////////////
    
    
    // create这个方法一定要在所有配置项之后调用
    this.editor.create()
    // 如果本地有存储加载本地存储内容
    let html = this.value || localStorage.editorCache
    if (html) this.editor.txt.html(html)
  }
}
</script>

<style>
    
    
    #wangTextId {
        border: 1px solid #ccc;
        height: 500px;
    }

</style>
