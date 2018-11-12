<style lang="less">
// @import "./common.less";
</style>
<template>
    <div>
        <Card title="后台角色管理">
            <Row>
                <!-- <Button icon="md-add" @click="dialogOpen('add')">新增</Button>
                <Button icon="md-create" @click="dialogOpen('edit')">编辑</Button> -->
            </Row>  
        </Card>
        <Row class="margin-top-10">
            <Table :loading="loading" :columns="tableTitle" :data="tableData" :stripe="true" highlight-row ref="currentRowTable" @on-current-change="selectOneRow"></Table>
            <div style="width:100%;height:15px"></div>
            <Page :total="page.total" :current="page.current" :page-size="page.size" show-sizer :page-size-opts="page.sizeOpts" @on-change="currentChange" @on-page-size-change="sizeChange" /> 
        </Row>
 
         <!-- ---------------------------------------------------------------------- 以下是 弹出框 ---------------------------------------------------------------------- -->
        <Modal v-model="visibility" :title="dialogName" width="600" ><!--  @on-ok="dialogSubmit" @on-cancel="dialogCancel"  -->
            <Form ref="gameForm" :model="entity" :label-width="120" :rules="rules">
                <FormItem label="名称" prop="title">
                    <Input v-model="entity.title" />
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
            igetRequst('sysRole/list/admin', param).then(res => {
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
        dialogSubmit(){
            console.log(this.entity)
            if(this.entity.areaCode == null || this.entity.areaCode.length == 0 || this.entity.items == null || this.entity.items.length == 0){
                this.$Message.error('比赛地点、比赛项目必填!');return false;
            }
            if(this.entity.applyStartTime == null || this.entity.applyEndTime == null|| this.entity.gameStartTime == null || this.entity.gameEndTime == null){
                this.$Message.error('报名时间、比赛时间必填!');return false;
            }
            if(this.entity.applyStartTime > this.entity.applyEndTime || this.entity.applyEndTime > this.entity.gameStartTime || this.entity.gameStartTime > this.entity.gameEndTime){
                this.$Message.error('时间大小应该符合： 报名开始<报名介绍<比赛开始<比赛结束!');return false;
            }
            this.$refs.gameForm.validate((valid) => {
                if (valid) {
                    
                    let obj = JSON.parse(JSON.stringify(this.entity));
                    obj.areaCode = this.entity.areaCode.join(",");
                    obj.items = this.entity.items.join(",");
                    console.log(this.obj)
                    if(this.entity.target == 'add'){
                        postRequst('game', obj).then(res => {
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
            let obj = JSON.parse(JSON.stringify(currentRow));
            let areaCodeArray = [], itemArray = [];
            obj.areaCode.split(",").forEach(e => {
                areaCodeArray.push(parseInt(e));
            });
            obj.items.split(",").forEach(e=>{
                itemArray.push(parseInt(e))
            })
            obj.areaCode = areaCodeArray;
            obj.items = itemArray;
            let url = obj.showImg
            if(this.hadVal(url)){
                obj.targetUrl = baseUrl + url.slice(1,url.length);
            }
            this.entity = obj;
        },
        clearEntity(){
            this.$refs.currentRowTable.clearCurrentRow();
            this.entity = {};
            this.$refs.upload.clearFiles()
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
                this.$refs.upload.clearFiles()
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
            {title:'内部编码', key : 'code'},
            {title:'角色名', key : 'name'},
            {title:'描述', key : 'remark'},
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
            // {title: '操作',key: 'action',
            //     render: (h, params) => {
            //         return h('div', [
            //             h('Button', {
            //                 props: {type: 'primary',size: 'small'},
            //                 style: {marginRight: '5px'},
            //                 on: {
            //                     click: () => {
            //                         this.showInDrawer(params)
            //                     }
            //                 }
            //             }, '查看'),
            //             h('Button', {
            //                 props: {type: 'error',size: 'small'},
            //                 on: {
            //                     click: () => {
            //                         //this.remove(params.index)
            //                     }
            //                 }
            //             }, '删除')
            //         ]);
            //     }
            // }
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

