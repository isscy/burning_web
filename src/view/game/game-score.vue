<style lang="less">
@import "./common.less";
</style>
<template>
    <div>
        <Card title="比赛成绩">
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
        <Modal v-model="uploadFileShowing" title="导入" width="400" ><!--  @on-ok="dialogSubmit" @on-cancel="dialogCancel"  -->
            <p style="color:red">先导出，只能在此导出的文件上修改然后再导入，不允许导入其他文件</p>
            <p style="color:red">在导出的文件中只能修改排名和成绩。他们都不能为空且排名必须是整数，否则导入失败</p>
            <Form :label-width="120" >
                <Upload :action="uploadFilePath" :before-upload="handleUpload" name="file" ref="upload">
                    <Button icon="ios-cloud-upload-outline">选择文件</Button>
                </Upload>
                <div v-if="uploadFileEntity !== null">
                    <p>文件名: {{ uploadFileEntity.name }} </p>
                    
                </div>
                    
            </Form>
            <div slot="footer">
                <Button @click="dialogCancel">取消</Button>
               <Button type="primary" @click="uploadFile" :loading="uploadFileStatus">{{ uploadFileStatus ? 'Uploading' : '上传' }}</Button>
            </div>
        </Modal>

        
            


    </div>
</template>
<script>
import excel from "@/libs/excel";
import {isInteger} from './validate.js'
import {igetRequst,postRequst,putRequst,igetDownload,postUpload} from "@/api/data";
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
            uploadFilePath: '', //图片上传地址
            pStyle: {},         // 抽屉样式
            viewEntity:{},       // 抽屉用的 当前实体类
            uploadFileShowing: false,  // 导入excel 可见性
            uploadFileEntity: '',    // 导入excel
            uploadFileStatus : false,           // 上传文件的状态
                
            
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
            igetRequst('game/list/admin', param).then(res => {
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
            this.uploadFileShowing = false;
        },
        selectOneRow(currentRow, oldCurrentRow){
            this.entity = currentRow;
            
            
            
        },
        export(id){
            igetDownload('gameApply/score/export/' + id, {}).then(res => {
                let url = window.URL.createObjectURL(new Blob([res.data],{'type':''}))
                let link = document.createElement('a')
                link.style.display = 'none'
                link.href = url
                link.setAttribute('download', 'excel.xls')
                document.body.appendChild(link)
                link.click()
            }).catch(err => {
                this.loading = false;
                this.$Message.error('提交错误!'); return false;
            })
        },
        // 处理上传
        handleUpload(file){
            this.uploadFileEntity = file;
            return false;
        },
        uploadFile(){
            if(this.uploadFileEntity == null || this.uploadFileEntity == '' || this.uploadFileEntity == undefined ){
                this.$Message.error('文件不能为空!'); return false;
            }
            this.uploadFileStatus = true;
            let param = new FormData(); //创建form对象
            param.append('file',this.uploadFileEntity);//
            postUpload(this.uploadFilePath + this.entity.id, param).then(res => {
                let r = res.data;
                if(r.code != '1'){
                    throw r.message;
                }
                this.$Message.info('提交成功!');
                //this.loadData();
                this.file = null;
                this.uploadFileStatus = false;
                this.dialogCancel();
            }).catch(err => {
                this.uploadFileStatus = false;
                this.$Message.error('提交错误!' + err); return false;
            })

               

        },
        openUploadDialog(id){
            this.$refs.upload.clearFiles()
            this.uploadFileShowing = true;

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
            {title:'名称', key : 'title'},
            {title:'成功报名数', key : 'pass'},
            {title:'状态', key : 'status',
                render: function (h, params) {
                    let text = '';
                    switch(params.row.status){
                        case '-1': text = '已取消';break; 
                        case '0': text = '未开始';break; 
                        case '1': text = '报名中';break; 
                        case '2': text = '报名结束';break; 
                        case '3': text = '进行中';break; 
                        case '4': text = '已结束';break; 
                    }
                    return h('div', text);
                }
            },
            {title: '操作',key: 'action',
                render: (h, params) => {
                    return h('div', [
                        h('Button', {
                            props: {type: 'primary',size: 'small'},
                            style: {marginRight: '5px'},
                            on: {
                                click: () => {
                                    this.export(params.row.id)
                                }
                            }
                        }, '导出'),
                        h('Button', {
                            props: {type: 'error',size: 'small'},
                            on: {
                                click: () => {
                                    this.openUploadDialog(params.row.id)
                                }
                            }
                        }, '导入')
                    ]);
                }
            }
        ]
        this.loadData();
        
        // 图片上传地址
        this.uploadFilePath = baseUrl + "gameApply/score/import/";
        this.pStyle = {fontSize: '16px',color: 'rgba(0,0,0,0.85)',lineHeight: '24px',display: 'block',marginBottom: '16px'}
            
            
            
            
            
        

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
    .demo-drawer-profile{
        font-size: 14px;
    }
    .demo-drawer-profile .ivu-col{
        margin-bottom: 12px;
    }
</style>

