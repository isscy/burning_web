<template>
    <div>
        <div class="demo-upload-list" v-for="(item,index) in dbDataList" :key="index">
            <template v-if="item.status === 'finished'" >
                <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
            <template v-else>
                <img :src="parseImgPath(item.path)"> 
                <div class="demo-upload-list-cover">
                    <Icon type="ios-eye-outline" @click.native="handleView(item)"></Icon>
                    <Icon type="ios-trash-outline" @click.native="handleRemove(item.id)" ></Icon>
                </div>
            </template>
            
        </div>
        <Upload ref="upload" :show-upload-list="false" :default-file-list="defaultList"
            :on-success="handleSuccess"
            :format="['jpg','jpeg','png']" :max-size="2048" type="drag" name="image"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            :action="uploadImagePath"
            style="display: inline-block;width:178px;">
            <div style="width: 178px;height:178px;line-height: 178px;">
                <Icon type="ios-cloud-upload-outline" size="80"></Icon>
            </div>
        </Upload>

        <Row class="margin-top-10">
            <div style="width:100%;height:15px"></div>
            <Page :total="page.total" :current="page.current" :page-size="page.size" show-sizer :page-size-opts="page.sizeOpts" @on-change="currentChange" @on-page-size-change="sizeChange" /> 
        </Row>
        <Modal title="查看原图" v-model="visible">
            <img :src="parseImgPath(entity.path)" v-if="visible" style="width: 100%">

            <div style="width:100%; margin-top:25px; margin-buttom:25px; height:10px">
                <hr>
            </div>
             <Input v-model="entity.sortNo">
                <span slot="prepend">排序序号</span>
                <Button title="设置排序序号" slot="append" icon="ios-build" @click="modifySort()"></Button>
            </Input>
            
        </Modal>
        

      
            


    </div>
</template>
<script>
import excel from "@/libs/excel";
import {isInteger} from '../game/validate.js'
import {igetRequst,postRequst,putRequst,deleteRequst} from "@/api/data";
import {getToken} from '@/libs/util'
import baseUrl from '@/libs/baseUrl'
export default {
    name: "info-banner",
    props: {
        requiredRules: {
            type: Array, default: () => {
                return [
                    { required: true, message: '必填项', trigger: 'blur' }
                ]
            }
        },
        isIntegerRules: {
            type: Array, default: () => {
                return [
                    { validator:isInteger, message: '必须是数字', trigger: 'blur' }
                ]
            }
        },

        
    
    },
    data() {
        return {
            loading: false, 
            page: {
                'total': 0,
                current: 1,
                size: 10,
                sizeOpts: [10, 20]
            },
            dbDataList: [], // 从服务器获取的数据
            uploadImagePath: '', // 图片上传地址
            imgName: '',
            visible: false,
            uploadList: [],
            defaultList: [], // 默认已上传的文件列表
            entity:{},
              
        };
    },
    methods: {
        loadData(){
            this.loading = true;
            let param = {
                'current': this.page.current,
                'size': this.page.size,
                'search': this.search,
                'status': this.status
            }
            igetRequst('banner/list/admin', param).then(res => {
                let r = res.data;
                if(r.code != '1' || r.data == null){
                    throw "err";
                }
                this.page.total = r.data.total;
                this.dbDataList = r.data.records
                this.loading = false;
            }).catch(err => {
                this.loading = false;
                this.$Message.error('获取数据错误!'); return false;
            })
        },
        sizeChange(count){this.page.size = count; this.loadData();},
        currentChange(count){this.page.current = count;this.loadData();},
        // 查看大图
        handleView (item) {
            this.entity = item;
            this.visible = true;
        },
        // 删除
        handleRemove (id) {
            this.$Modal.confirm({
                title: '确认', content: '<p>确认要删除吗</p>',
                onOk: () => {
                    deleteRequst('banner/' + id, {}).then(res => {
                        let r = res.data;
                        if(r.code != '1' ){
                            throw "err";
                        }
                        this.$Message.success('删除成功!');
                    this.loadData();
                    }).catch(err => {
                        this.loading = false;
                        this.$Message.error('获取数据错误!'); return false;
                    })
                },
            });
        },
        handleSuccess (res, file) {
            console.log(res)
            if(res.code != '1' || res.data == null){
                this.$Message.info('上传失败!'); return false;
            }
            this.loadData();
        },
        handleFormatError (file) {
            this.$Notice.warning({
                title: 'The file format is incorrect',
                desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
            });
        },
        handleMaxSize (file) {
            this.$Notice.warning({
                title: 'Exceeding file size limit',
                desc: 'File  ' + file.name + ' is too large, no more than 2M.'
            });
        },
        handleBeforeUpload () {
            const check = this.uploadList.length < 5;
            if (!check) {
                this.$Notice.warning({
                    title: 'Up to five pictures can be uploaded.'
                });
            }
            return check;
        },
        modifySort(){
            putRequst('banner/sort', this.entity).then(res => {
                let r = res.data;
                if(r.code != '1' ){
                    throw "err";
                }
                this.visible = false;
                this.$Message.success('提交成功!');
                this.loadData();
            }).catch(err => {
                this.loading = false;
                this.$Message.error('提交错误!'); return false;
            })


        },
       
        parseImgPath(url){
            if(this.hadVal(url))
                return baseUrl + url.slice(1,url.length);
            return '';
        },
        hadVal(val){
            if(val == null || val == '' || val == undefined)
                return false;
            return true;
        },
            
        
    
    },
    created() {
        
        this.loadData();
       
        // 图片上传地址
        this.uploadImagePath = baseUrl + "noAuth/banner";
        

    },
    computed: {
        rules () {
            return {
                title: this.requiredRules,
                location: this.requiredRules,
                maxPeople: this.isIntegerRules
                
            }
        }
    },
    mounted() {}
};
</script>
<style>
    .demo-upload-list{
        display: inline-block;
        width: 180px;
        height: 180px;
        text-align: center;
        line-height: 180px;
        border: 1px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0,0,0,.2);
        margin-right: 15px;
    }
    .demo-upload-list img{
        width: 100%; height: 100%;
        max-width: 100%; max-height: 100%;
    }
    .demo-upload-list-cover{
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.6);
    }
    .demo-upload-list:hover .demo-upload-list-cover{
        display: block;
    }
    .demo-upload-list-cover i:nth-child(2){
        color: red;
        font-size: 40px;
        cursor: pointer;
        margin: 0 2px;
    }
    .demo-upload-list-cover i{
        color: #fff;
        font-size: 80px;
        cursor: pointer;
        margin: 0 2px;
    }
</style>

