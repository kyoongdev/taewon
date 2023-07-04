    /* canvas and map */
    #map{
        min-height:620px;
    }
    #videoCanvas{
        width:100%;
    }
    .controler-wrapper{
        background-color:#0045BC;
        border-radius: 15px;
        flex-direction: column;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    @media (min-width:960px){
        .controler-wrapper{
            position:absolute;
            max-width:600px;
            max-height:580px;
            height:580px;
            right:20px;
            top:50%;
            transform:translateY(-50%);
        }
    }
    .controler-canvas-wrapper{
        background-color: #fff;
        display: flex;
        width: 96%;
        border-radius: 15px 15px 0px 0px;
        height: calc(100% - 93px);
    }
    .controler-canvas-wrapper canvas{
        border-radius: 15px 15px 0px 0px;
    }

    .map-wrapper{
        position:relative;
        
    }
    .controler-button-wrapper{
        /*position:absolute;
        bottom:11px;
        left:0;*/
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: center;
    }
    .controler-button-wrapper > div > img{
        margin-right:10px;
    }
    #stop, #off{
        width: 48%;
        max-height:60px;
        height:60px;
        text-align: center;
        color:#fff;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    #stop{
        background-color:#0051DC;
        border-radius: 0px 0px 0px 15px;
    }
    #off{
        background-color:#0B5EEF;
        border-radius: 0px 0px 15px 0px;
    }


    .default-canvas-wrapper > span{
        position:absolute;
        top:21px;
        left:25px;
        font-size:16px;
        font-weight:bold;
        transform: rotate(0.1deg);
    }
    .default-canvas-wrapper > img{
        position:absolute;
        left:50%;
        transform:translateX(-50%);
        bottom:93px;
    }

    /* canvas and map end */
    
    /* vehicle information table */
    .vehicle-table-wrapper{
        padding:0px 60px;
    }
    .vehicle-table > thead{
        /*height:50px;
        border-radius:50px;
        background-color:#F8F8F8;
        */
    }
    /*
    .vehicle-table > thead > tr > th{
        font-size:16px;
        font-weight:bold;
        transform: rotate(0.1deg);
    }
    */
    .vehicle-table > tbody{
        cursor:pointer;
    }
    .vehicle-table > tbody > tr{
        height:44px;
        font-size:14px;
        font-weight:bold;
        cursor:
        
    }
    .vehicle-table th:first-child{
        border-radius: 10px 0 0 10px;
    }
    .vehicle-table th:last-child{
        border-radius:0 10px 10px 0;
    }
    .vehicle-table > tbody > tr{
        transition:0.3s background-color;
    }
    .vehicle-table > tbody > tr:not(:last-child){
        border-top:2px solid #fff;
        border-bottom:2px solid #F1F1F1;
        border-right:2px solid #fff;
        border-left:2px solid #fff;
    }
    .vehicle-table > tbody > tr:last-child{
        border-top:2px solid #fff;
        border-bottom:2px solid #fff;
        border-right:2px solid #fff;
        border-left:2px solid #fff;
    }
/*
    .vehicle-table > tbody > tr:hover{
        background-color:#F9FCFF;
        border:2px solid #4898FF;
    }
*/
    .vehicle-table > tbody > tr:hover td{
        background-color:#F9FCFF;
        border-top:2px solid #4898FF;
        border-bottom:2px solid #4898FF;
        
    }
    .vehicle-table > tbody > tr:hover td:first-child{
        background-color:#F9FCFF;
        border-left:2px solid #4898FF;
        /*border-radius:12px 0px 0px 12px;*/
    }
    .vehicle-table > tbody > tr:hover td:last-child{
        background-color:#F9FCFF;
        border-right:2px solid #4898FF;
        /*border-radius:0px 12px 12px 0px;*/
        
    }
    .percent-background{
        width:100px;
        display:inline-block;
        background-color:#E9E9E9;
    }
    .percent:after{
        content:" ";
    }
    .status-normal{
        background-color:#0045BC;
    }
    .status-risky{
        background-color:#FF488D;
    }
    .table-container{
        top: 49px;
        left: 9px;
        right: 9px;
        bottom: 16px;
        overflow: auto;
        position: absolute;
    }
    .table-box-wrap {
		position: relative;
        margin-top: 20px;
        padding-top: 50px;
    }
    .table-box-wrap .table-box {
        // max-height: 220px;
        overflow: overlay;
        overflow-x: hidden;
    }
    .table-box-wrap .table-box table {
        width: 100%;
        table-layout: fixed;
        border-spacing: 0;
        border-collapse: collapse;
    }
    .table-box-wrap .table-box table thead tr {
        position: absolute;
        top: 0;
        left: 0;
    }
    .table-box-wrap .table-box table thead tr th {
        font-weight: normal;
        /*width: 120px;*/
        height: 50px;
        background:#F8F8F8;;

    }

    .table-box-wrap .table-box table td {
        text-align: center;
        height: 40px;
        border-top: 1px solid #ccc;
    }

    .table-box-wrap .table-box table tr {
        display: inline-table;
        width: 100%;
        table-layout: fixed;
    }

    .table-box-wrap .table-box table tbody tr {
    display: table-row;
    }
    /* vehicle information table end */
    
    /* status bar*/
    .status-indicator{
        background-color: #F3F3F3;
        display: inline-block;
        border-radius: 0px 0px 20px 20px;
    }
    .status-indicator > li{
        padding:6.5px 10px;
        font-size:14px;
        font-weight:bold;
        transform: rotate(0.1deg);
    }
    .status-indicator > li:first-child{
        margin-left:10px;
    }
    .status-indicator > li:last-child{
        margin-right:10px;
    }
    .status{
        border-radius: 50%;
        width: 14px;
        height: 14px;
        display: inline-block;
        vertical-align: middle;
        margin-right:10px;
    }
    .status-indicator-run{
        background-color: #0055E6;
    }
    .status-indicator-stop{
        background-color: #DF0000;
    }
    .status-indicator-cancelstop{
        background-color: #7400D8;
    }
    .status-indicator-end{
        background-color: #A45200;
    }
    .status-indicator-off{
        background-color: #000;
    }
    .status-indicator-charging{
        background-color: #95C900;
    }
    /* status bar end */