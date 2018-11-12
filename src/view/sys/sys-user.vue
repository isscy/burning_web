<style lang="less">
// @import "./common.less";
</style>
<template>
    <div>
        <Card title="后台用户管理">
            <Row>
                <Button icon="md-add" @click="dialogOpen('add')">新增</Button>
                <!-- <Button icon="md-create" @click="dialogOpen('edit')">编辑</Button> -->
            </Row>  
        </Card>
        <Row class="margin-top-10">
            <Table :loading="loading" :columns="tableTitle" :data="tableData" :stripe="true" highlight-row ref="currentRowTable" @on-current-change="selectOneRow"></Table>
            <div style="width:100%;height:15px"></div>
            <Page :total="page.total" :current="page.current" :page-size="page.size" show-sizer :page-size-opts="page.sizeOpts" @on-change="currentChange" @on-page-size-change="sizeChange" /> 
        </Row>
 
         <!-- ---------------------------------------------------------------------- 以下是 弹出框 ---------------------------------------------------------------------- -->
        <Modal v-model="visibility" title="用户设置" width="600" ><!--  @on-ok="dialogSubmit" @on-cancel="dialogCancel"  -->
            <Form ref="gameForm" :model="entity" :label-width="120" :rules="rules">
                <FormItem label="登录名" prop="userName">
                    <Input v-model="entity.userName" />
                </FormItem>
                <FormItem label="昵称" prop="nickName">
                    <Input v-model="entity.nickName" />
                </FormItem>
                <FormItem label="密码" prop="password">
                    <Input v-model="entity.password" />
                </FormItem>
                <FormItem label="角色" prop="role">
                     <Select v-model="entity.role">
                        <Option value="bbs" >新闻维护员</Option>
                        <Option value="game" >赛事管理员</Option>
                    </Select>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="dialogCancel">取消</Button>
                <Button type="primary" @click="dialogSubmit">提交</Button>
            </div>
        </Modal>

        
            


    </div>
</template>
<script>
import excel from "@/libs/excel";
// import {isInteger} from './validate.js'
import {igetRequst,postRequst,putRequst} from "@/api/data";
import {getToken} from '@/libs/util'
import baseUrl from '@/libs/baseUrl'
export default {
    name: "game-item",
    props: {
        requiredRules: {
            type: Array, default: () => {
                return [
                    { required: true, message: '必填项', trigger: 'blur' }
                ]
            }
        },
    },
    data() {
        return {
            search: '',
            status: '',
            loading: false,
            tableTitle: [],
            tableData: [],
            page: {
                'total': 0,
                current: 1,
                size: 10,
                sizeOpts: [4,10, 20]
            },
            entity: {},
            dialogName: '赛事',
            visibility: false,
            viewVisibility: false,
            areaData:[], // 地区json
            gameItemData: [], //    赛事子项json
            uploadImagePath: '', //图片上传地址
            pStyle: {},         // 抽屉样式
            viewEntity:{}       // 抽屉用的 当前实体类
                
            
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
            igetRequst('sysUser/list/admin', param).then(res => {
                let r = res.data;
                if(r.code != '1' || r.data == null){
                    throw "err";
                }
                this.page.total = r.data.total;
                this.tableData = r.data.records
                this.loading = false;
            }).catch(err => {
                this.loading = false;
                this.$Message.info('获取数据错误!'); return false;
            })

        },
        sizeChange(count){
            this.page.size = count;
            this.loadData();
        },
        currentChange(count){
            this.page.current = count;
            this.loadData();
        },
        dialogOpen(type){
            if('add' == type){
                this.dialogName = '新增赛事';
                this.clearEntity();
                this.entity.target = 'add';
                this.visibility = true;
            }else if ('edit' == type) {
                this.dialogName = '修改赛事'
                if(!this.hadVal(this.entity) || !this.hadVal(this.entity.id)){
                    this.$Message.error('请选中一行数据!'); return false;
                }
                this.entity.target = 'edit';
                this.visibility = true;
            }
        },
        updateStatus(id, targetStatus){
            postRequst('customer/status/' + id + "?status=" + targetStatus, {}).then(res => {
                let r = res.data;
                if(r.code != '1'){
                    throw r.message;
                }
                this.$Message.info('提交成功!');
                this.loadData();
            }).catch(err => {
                this.loading = false;
                this.$Message.error('提交错误! ' + err); return false;
            })
        },
        dialogSubmit(){
            console.log(this.entity)
            if(!this.hadVal(this.entity.userName)|| !this.hadVal(this.entity.password) || !this.hadVal(this.entity.role)){
                this.$Message.error('必填项缺失!');return false;
            }
            this.$refs.gameForm.validate((valid) => {
                if (valid) {
                    if(this.entity.target == 'add'){
                        postRequst('sys-user/add', this.entity).then(res => {
                            let r = res.data;
                            if(r.code != '1'){
                                throw "err";
                            }
                            this.$Message.info('提交成功!');
                            this.loadData();
                            this.dialogCancel();
                        }).catch(err => {
                            this.loading = false;
                            this.$Message.error('提交错误!'); return false;
                        })
                    } else if (this.entity.target == 'edit'){
                        putRequst('game', obj).then(res => {
                            let r = res.data;
                            if(r.code != '1'){
                                throw "err";
                            }
                            this.$Message.info('提交成功!');
                            this.loadData();
                            this.dialogCancel();
                        }).catch(err => {
                            this.loading = false;
                            this.$Message.error('提交错误!'); return false;
                        })
                    }
                    
                }
            })
            
        },
        dialogCancel(){
            this.clearEntity();
            this.visibility = false;
        },
        selectOneRow(currentRow, oldCurrentRow){
            
            this.entity = currentRow;
        },
        clearEntity(){
            this.$refs.currentRowTable.clearCurrentRow();
            this.entity = {};
            // this.$refs.upload.clearFiles()
        },
        hadVal(val){
            if(val == null || val == '' || val == undefined)
                return false;
            return true;
        },
        loadAreaData(item, callback) {
            item.loading = true;
            let subLevel = parseInt(item.level) + 1
            if(subLevel <= 3){
                setTimeout(() => {
                    igetRequst('dataArea/onceLevel/' + subLevel, {'parentId':item.value}).then(res => {
                        let r = res.data;
                        if(r.code != '1' || r.data == null){
                            throw "err";
                        }
                        item.children = r.data;
                        item.loading = false;
                        callback();
                    }).catch(err => {
                        this.loading = false;
                        this.$Message.info('获取地区json错误!'); return false;
                    })
                }, 1000);
            }else{
                delete item.children
                //callback();
            }
            item.loading = true;
        },
        uploadImageSuccess(response, file, fileList){
            if(response.code != '1' || response.data == null){
                this.$Message.error(response.message); 
                // this.$refs.upload.clearFiles()
                return false;
            }
            let url = response.data.url;
            this.entity.showImg = url
            this.entity.targetUrl = this.parseImgPath(url);
            console.log(this.entity.showImg)

        },
        showInDrawer(params){
            console.log(params.row.id)
            igetRequst('game/' + params.row.id, {}).then(res => {
                let r = res.data;
                if(r.code != '1' || r.data == null){
                    throw "err";
                }
                this.viewEntity = r.data;
                this.viewVisibility = true;
            }).catch(err => {
                this.$Message.info('找不到'); return false;
            })
        },
        parseImgPath(url){
            if(this.hadVal(url))
                return baseUrl + url.slice(1,url.length);
            return '';
        }
    
    },
    created() {
        this.tableTitle = [
            {title:'登录名', key : 'userName'},
            {title:'用户名称', key : 'nickName'},
            {title:'角色', key : 'roles'},
            {title:'状态', key : 'status',
                render: function (h, params) {
                    let text = ''; let sty = {}
                    if(params.row.status == '1'){
                        text = '正常';sty = {color:'green'}
                    }
                    if(params.row.status == '2'){
                        text = '锁定';sty = {color:'red'}
                    }
                    return h('div',{style:sty}, text);
                }
            },
            {title: '操作',key: 'action',
                render: (h, params) => {
                    let text = '', targetStatus = '';
                    if(params.row.status == '1'){
                        text = '禁用';targetStatus = '2'
                    }
                    if(params.row.status == '2'){
                        text = '启用';targetStatus = '1'
                    }
                    return h('div', [
                        h('Button', {
                            props: {size: 'small'},
                            style: {marginRight: '5px'},
                            on: {click: () => {this.updateStatus(params.row.id, targetStatus)}}
                        }, text),
                        // h('Button', {
                        //     props: {type: 'primary',size: 'small'},
                        //     style: showStyle,
                        //     on: {click: () => {this.audit(params)}}
                        // }, '审核')
                    ]);
                }
            }
        ]
        this.loadData();
        
        // 图片上传地址
        this.uploadImagePath = baseUrl + "noAuth/upload/image";
        this.pStyle = {fontSize: '16px',color: 'rgba(0,0,0,0.85)',lineHeight: '24px',display: 'block',marginBottom: '16px'}
            
            
            
            
            
        

    },
    computed: {
        rules () {
            return {
                title: this.requiredRules,
                location: this.requiredRules,
                //maxPeople: this.isIntegerRules
                
            }
        }
    },
    mounted() {}
};
</script>
<style>
    .demo-drawer-profile{
        font-size: 14px;
    }
    .demo-drawer-profile .ivu-col{
        margin-bottom: 12px;
    }
</style>

