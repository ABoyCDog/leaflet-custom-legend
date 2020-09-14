/**
 * @class LMap.setLegend
 * @extents {L.Control}
 * @param {object} options - 图例传入参数
 * @param {string} [options.position] - 图例控件位置
 * @param {string} [options.title] - 图例标题
 * @param {string} [options.legendType] - 图例类型
 * @param {array}  [options.imgArr] - 图文型图例参数（对象数组，含图片url与文字描述）
 * @param {array}  [options.colorArr] - 颜色型图例参数数组（对象数组，含颜色及对应文字描述）
 * @param {string} [options.imgId] - 所添加的img图例的唯一标识
 * @param {string} [options.colorId] - 所添加的color图例的唯一标识
 */
L.Control.setLegend = L.Control.extend({
    options: {
        position: 'topright',
        title: '图例',
        legendType: '',
        imgArr: [],
        colorArr: [],
        imgId: '',
        colorId: '' 
    },
    initialize: function(options) {
        L.Util.extend(this.options, options)
    },
    onAdd: function(map) {
        // _container为控件容器
        this._container = L.DomUtil.create('div', 'leaflet-control-clegend')
        this._container.setAttribute('id', 'legendContainer') // 为content设置id 方便判别时隐藏控件
        
        //////////////////////////////////////////////////////////////////////////////////////////////////
        // 创建一个div容器包含所有的内容
        this.mainDiv = L.DomUtil.create('div', 'leaflet-control-max-div')
        this.mainDiv.style.display="block"
        // 创建title
        var title = L.DomUtil.create('div', 'leaflet-control-clegend-title')
        title.innerHTML = '图例'
        // this._container.appendChild(title)
        this.mainDiv.appendChild(title)
        // 创建关闭按钮
        var closeBtn = L.DomUtil.create('a', 'leaflet-control-legend-close')
        // closeBtn.innerHTML = 'X'
        closeBtn.innerHTML = `<img src="../src/assets/images/close.png" style="width:18px;height:18px;">`
        title.appendChild(closeBtn)
        // 注册关闭事件
        L.DomEvent.on(closeBtn, 'click', this._onCloseControl, this)

        // 创建legend的内容
        this.setContent()

        /////////////////////////////////////////////////////////////////////////////////////////////////
        // 创建一个button展开隐藏的图例
        this._showLegendBtn = L.DomUtil.create('select', 'show-legend-button')
        this._showLegendBtn.style.display="none"
        this._showLegendBtn.innerHTML = '图例'
        var option = L.DomUtil.create('option', '')
        option.innerHTML = '图例'
        this._showLegendBtn.appendChild(option)
        L.DomEvent.on(this._showLegendBtn, 'click', this._showControl, this)
        
        // 添加button和this.mainDiv到父容器_container中
        this._container.appendChild(this._showLegendBtn)
        this._container.appendChild(this.mainDiv)
        
        return this._container
    },
    // 添加content
    setContent: function() {
        this.content = L.DomUtil.create('div', 'leaflet-control-legend-content')
        this.content.setAttribute('id', 'legendMainContent') // 为content设置id 方便判别时隐藏控件
        if(this.options.legendType === 'imgType') { // 图文式
            this.setImgContent(this.options.title, this.options.legendType, this.options.imgArr,this.options.imgId)
        }
        if(this.options.legendType === 'colorType') { // 颜色渐变式
            this.setColorContent(this.options.title, this.options.legendType, this.options.colorArr, this.options.colorId)
        }
        this.mainDiv.appendChild(this.content)
    },
    // 添加imgContent
    /**
     * 
     * @param {string} title - 图例标题
     * @param {string} legendType - 图例类型
     * @param {array} imgArr - img图例数组
     * @param {string} imgId - img唯一标识 
     */
    setImgContent: function(title, legendType, imgArr, imgId) {
        this.imgContent = L.DomUtil.create('div', 'leaflet-control-legend-imgcontent')
        this.imgContent.setAttribute('id', `${imgId}`) // 为imgContent设置id 方便控制现隐
        // this.setTitle(title, legendType, imgId) // 添加不同图例标题
        for(let i = 0; i < imgArr.length; i++) {
            this._addImgItem(imgArr[i])
        }

        // 判断去重
        if(this.content.childNodes.length === 0) { // 还是空的图例
            this.content.appendChild(this.imgContent)
        } else { // 已存在一个图例
            let arr = []
            this.content.childNodes.forEach( item => {
                arr.push(item.id)
            })
            if(arr.indexOf(imgId) > -1) { // 已存在相同的图例
                return
            } else {
                this.content.appendChild(this.imgContent)
            }
        }
    },
    // 添加colorContent
    /**
     * 
     * @param {string} title - 图例标题
     * @param {string} legendType - 图例类型
     * @param {array} colorArr - color图例数组
     * @param {string} colorId - color唯一标识 
     */
    setColorContent: function(title, legendType, colorArr, colorId) {
        this.colorContent = L.DomUtil.create('div', 'leaflet-control-legend-colorContent')
        this.colorContent.setAttribute('id', `${colorId}`) // 为colorContent设置id 方便控制现隐
        this.setTitle(title, legendType, colorId)
        for(let i = 0; i < colorArr.length; i++) {
            this._addColorItem(colorArr[i])
        }
        this.content.appendChild(this.colorContent)
    },
    // 添加图例小标题
    /**
     * 
     * @param {string} title - 图例标题
     * @param {string} legendType - 图例类型
     * @param {string} id - 唯一标识id
     */
    setTitle: function(title, legendType, id) {
        let titleContent = L.DomUtil.create('span', 'leaflet-control-legend-content-title')
        if(legendType === 'imgType') {
            titleContent.setAttribute('id', `${id}`)
            titleContent.innerHTML = `<strong>${title}</strong>`
            this.imgContent.appendChild(titleContent)
        }
        if(legendType === 'colorType') {
            titleContent.setAttribute('id', `${id}`)
            titleContent.innerHTML = `<strong>${title}</strong>`
            this.colorContent.appendChild(titleContent)
        }
    },
    // 逐行添加图文式图例
    _addImgItem: function(obj) {
        let imglegend = L.DomUtil.create('div', 'legend-imgitem-div')
        imglegend.innerHTML = `<img src="${obj.url}" width="${obj.size[0]}" height="${obj.size[1]}" style="margin:4px 15px 0 15px;" />
                               <span style="position:absolute;margin-top:6px;">${obj.label}</span>
                              `
        this.imgContent.appendChild(imglegend) 
    },
    // 逐行添加颜色渐变式图例
    _addColorItem: function(obj) {
        let colorlegend = L.DomUtil.create('div', 'legend-coloritem-div')
        colorlegend.innerHTML = `<span style="float:left;margin-left:12px;height:${obj.size[0]}px;width:${obj.size[1]}px;background:${obj.color};"></span>
                                <p style="margin:0;">${obj.label}</p>`
        this.colorContent.appendChild(colorlegend)
    },
    // 隐藏对应的imgContent或者colorContent
    hideOneContent: function(id) {
        // console.log('Hide!!!')
        document.getElementById(id).setAttribute('style', 'display: none')
        // document.getElementById(id).style.display = 'none'
    },
    // 显示对应的imgContent或colorContent
    showOneContent: function(id) {
        // console.log('Show!!!')
        document.getElementById(id).setAttribute('style', 'display:block')
    },
    // 移除对应的imgContent
    removeImgContent: function(imgId) {
        // console.log('remove imgLegend!!!')
        let divobj = document.getElementById(imgId)
        if(divobj === null) return
        divobj.parentNode.removeChild(divobj)
    },
    // 移除对应的colorCotent
    removeColorContent: function(colorId) {
        // console.log('remove colorContent!!!')
        let colorDiv = document.getElementById(colorId)
        if(colorDiv === null) return
        colorDiv.parentNode.removeChild(colorDiv)
    },
    // 判断content是否为空
    judgeContent: function() {
        if(this.content.innerHTML === '') {
            return true
        } else {
            return false
        }
    },
    // 将content里的内容置空
    setContentToNULL: function() {
        this.content.innerHTML = ''
    },
    // 隐藏图例
    _onCloseControl: function () {
        this.mainDiv.style.display="none"
        this._showLegendBtn.style.display="block"
    },
    // 显示隐藏的图例
    _showControl: function() {
        this.mainDiv.style.display="block"
        this._showLegendBtn.style.display="none"
    }
})