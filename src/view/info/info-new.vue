<style lang="less">
// @import "./common.less";
</style>
<template>
    <div>
        <Card title="新闻列表">
            <Row>
                <Button icon="md-add" @click="dialogOpen('add')">新增</Button> &nbsp;&nbsp;&nbsp;
                <Button icon="md-create" @click="dialogOpen('edit')">编辑</Button> &nbsp;&nbsp;&nbsp;
                
            </Row>  
        </Card>
        <Row class="margin-top-10">
            <Table :loading="loading" :columns="tableTitle" :data="tableData" :stripe="true" highlight-row ref="currentRowTable" @on-current-change="selectOneRow"></Table>
            <div style="width:100%;height:15px"></div>
            <Page :total="page.total" :current="page.current" :page-size="page.size" show-sizer :page-size-opts="page.sizeOpts" @on-change="currentChange" @on-page-size-change="sizeChange" /> 
        </Row>
 
         <!-- ---------------------------------------------------------------------- 以下是 弹出框 ---------------------------------------------------------------------- -->
        <Modal v-model="visibility" :title="dialogName" width="900" ><!--  @on-ok="dialogSubmit" @on-cancel="dialogCancel"  -->
            <Form ref="gameForm" :model="entity" :label-width="100" :rules="rules">
                <FormItem label="tag" prop="title">
                    <!-- <Input v-model="entity.tags" /> -->
                    <Select v-model="entity.tags"  style="width:200px">
                        <Option value="国内新闻">国内新闻</Option>
                        <Option value="国际新闻">国际新闻</Option>
                        <Option value="热点新闻">热点新闻</Option>
                        <Option value="视频">视频</Option>
                    </Select>
                </FormItem>
                <FormItem label="标题" prop="title">
                    <Input v-model="entity.title" />
                </FormItem>
                <FormItem label="精华" prop="isNice">
                    <RadioGroup v-model="entity.isNice" type="button">
                        <Radio key="0" label="0">普通</Radio>
                        <Radio key="1" label="1">精华</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="置顶" prop="isTop">
                    <RadioGroup v-model="entity.isTop" type="button">
                        <Radio key="0" label="0">普通</Radio>
                        <Radio key="1" label="1">置顶</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="展示图" prop="showImg">
                    <Upload :action="uploadImagePath" :on-success="uploadImageSuccess" name="newUploadImg" ref="upload">
                        <Button icon="ios-cloud-upload-outline">上传图片</Button>
                    </Upload>
                    <a target="_blank"  v-if="hadVal(entity.showImg)" :href="entity.targetUrl">点击查看</a>
                </FormItem>
                <v-editor ref="myEditor" id="editor1" v-model="entity.content"></v-editor>
            </Form>
            <div slot="footer">
                <Button @click="dialogCancel">取消</Button>
                <Button type="primary" @click="dialogSubmit">提交</Button>
            </div>
        </Modal>
        <!--  -------------------------------------以下是抽屉 ----------------------------------- - -->
        <Drawer :closable="false" width="400" v-model="viewVisibility">
            <Page :total="subPage.total" :current="subPage.current" :page-size="subPage.size" show-sizer :page-size-opts="subPage.sizeOpts" @on-change="subCurrentChange" @on-page-size-change="subSizeChange" /> 
            <Divider />
            <div class="demo-drawer-profile" v-for="(item, key) in viewEntitys" :key="key">
                <Row>
                    <Col span="20">
                        <Card>
                            <p slot="title">
                                {{item.createName}}：
                                <Button type="error" @click="deleteComment(item.id)" size="small" style="float:right">删除</Button>
                            </p>
                            <p>{{item.content}}</p>
                           
                        </Card>
                    </Col>
                </Row>
                <Divider />
                
            </div>
            
        </Drawer>

        
            


    </div>
</template>
<script>
import excel from "@/libs/excel";
// import {isInteger} from './validate.js'
import Editor from '@/components/editor/editor.vue'
import {igetRequst,postRequst,putRequst,deleteRequst} from "@/api/data";
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
            subPage: {
                'total': 0,
                current: 1,
                size: 4,
                sizeOpts: [4,5,8]
            }, // 抽屉用的： 分页
            pStyle: {},         // 抽屉样式
            viewEntitys:[],       // 抽屉用的 当前评论的列表
            uploadURL: ''
                
            
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
            igetRequst('news/list/admin', param).then(res => {
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
        sizeChange(count){this.page.size = count;this.loadData();},
        currentChange(count){this.page.current = count;this.loadData();},
        subSizeChange(count){this.subPage.size = count;this.showInDrawer(this.entity.id);},
        subCurrentChange(count){this.subPage.current = count;this.showInDrawer(this.entity.id);},
            
            
        
        deleteOne(param){
            deleteRequst('news/' + param.row.id, {}).then(res => {
                let r = res.data;
                if(r.code != '1'){
                    throw "err";
                }
                this.$Message.info('删除成功!');
                this.loadData()
            }).catch(err => {
                this.$Message.error('删除失败'); return false;
            })

        },
        dialogOpen(type){
            if('add' == type){
                this.dialogName = '添加新闻';
                this.clearEntity();
                this.entity.target = 'add';
                this.visibility = true;
            }else if ('edit' == type) {
                this.dialogName = '修改新闻'
                if(!this.hadVal(this.entity) || !this.hadVal(this.entity.id)){
                    this.$Message.error('请选中一行数据!'); return false;
                }
                this.entity.target = 'edit';
                this.$refs.myEditor.editor.txt.html(this.entity.content)
                this.visibility = true;
            }
        },
        dialogSubmit(){
            let editor1 = document.getElementById("editor1")
            console.log(this.$refs.myEditor.editor.txt.html())
            
            let obj = this.entity;
            if(this.entity.title == null || this.entity.title == ''){
                this.$Message.error('标题必填!');return false;
            }
            let content = this.$refs.myEditor.editor.txt.html();
            let summary = this.$refs.myEditor.editor.txt.text();
            if(!this.hadVal(content) || !this.hadVal(summary)){
                this.$Message.error('内容必填!');return false;
            }
            obj.content = content;
            obj.summary = summary.replace(/&nbsp;/g,'').substring(0, 50);
            console.log(obj.summary)
            console.log(this.entity)
            if(this.entity.target == 'add'){
                postRequst('news', obj).then(res => {
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
                putRequst('news', obj).then(res => {
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
        },
        dialogCancel(){
            this.clearEntity();
            this.$refs.myEditor.editor.txt.clear()
            this.visibility = false;
        },
        selectOneRow(currentRow, oldCurrentRow){
            this.entity = currentRow;
            let url = currentRow.showImg
            if(this.hadVal(url)){
                this.entity.targetUrl = baseUrl + url.slice(1,url.length);
            }
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
        clearEntity(){
            this.$refs.currentRowTable.clearCurrentRow();
            this.$refs.upload.clearFiles()
            this.entity = {};
        },
        showInDrawer(id){
            let param = {
                'current': this.subPage.current,
                'size': this.subPage.size,
            }
            igetRequst('noAuth/news/comment/list/' + id, param).then(res => {
                let r = res.data;
                if(r.code != '1' || r.data == null){
                    throw "err";
                }
                this.subPage.total = r.data.total;
                this.viewEntitys = r.data.records
                this.viewVisibility = true;
            }).catch(err => {
                this.$Message.error('找不到'); return false;
            })
        },
        deleteComment(commentId){
            this.$Modal.confirm({
                title: '确认',
                content: '<p>确认要删除这条评论吗</p>',
                onOk: () => {
                    deleteRequst('news/comment/' + commentId, {}).then(res => {
                        let r = res.data;
                        if(r.code != '1'){
                            throw "err";
                        }
                        this.$Message.info('删除成功!');
                        this.showInDrawer(this.entity.id)
                    }).catch(err => {
                        this.$Message.error('删除失败'); return false;
                    })
                },
            });
        },
        
        hadVal(val){
            if(val == null || val == '' || val == undefined)
                return false;
            return true;
        },
        parseImgPath(url){
            if(this.hadVal(url))
                return baseUrl + url.slice(1,url.length);
            return '';
        },
        
    
    },
    created() {
        this.tableTitle = [
            {title:'tag', key : 'tags', align:'center'},
            {title:'标题', key : 'title', align:'center'},
            {title:'内容截取', key : 'summary', align:'center'},
            {title:'状态', key : 'status', align:'center',
                render: function (h, params) {
                    let nice = '非精华', top = '非置顶'; let niceProp = {color:'default'}, topProp = {color:'default'}
                    if(params.row.isNice == '1'){
                        nice = '精华';niceProp = {color:'success'}
                    }
                    if(params.row.isTop == '1'){
                        top = '置顶';topProp = {color:'primary'}
                    }
                    return h('div',[
                            h('Tag',{props:niceProp,style:{marginRight:'10px'}},nice),
                            h('Tag',{props:topProp},top)
                        ]);
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
                                    this.showInDrawer(params.row.id)
                                }
                            }
                        }, '评论列表'),
                        h('Button', {
                            props: {type: 'error',size: 'small'},
                            on: {
                                click: () => {
                                    this.$Modal.confirm({
                                        title: '确认',
                                        content: '<p>确认要删除吗</p>',
                                        onOk: () => {
                                            this.deleteOne(params)
                                        },
                                        
                                    });
                                }
                            }
                        }, '删除')
                    ]);
                }
            }
        ]
        this.loadData();
        // 图片上传地址
        this.uploadImagePath = baseUrl + "noAuth/upload/image";
        this.pStyle = {fontSize: '16px',color: 'rgba(0,0,0,0.85)',lineHeight: '24px',display: 'block',marginBottom: '16px'}
            
            
            
            
            
        

    },
    components: {
        'v-editor': Editor
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

