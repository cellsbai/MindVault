
## Zip ✅
> 整合了 service-pdf service-zip，涵盖了 导出zip、导出pdf、pdf增加水印

需要验证
- 验证200份报告导出上限，是否有kill的情况
- zip、pdf导出后图片是否清晰
- 共享文件水印是否正常


b37
0eb


zip上线增加配置
env
        - name: ZIP_SHARED_DIR
          value: /data/fc19f7e5fd4e
        - name: OSS_INTERNAL
          value: "true"
        - name: DINGTALK_WEBHOOK_URL
          value: https://oapi.dingtalk.com/robot/send?access_token=cc7ddaf4f77bea37d098f54c00786b9112b5f0f28bea0af5dfddd5f28a0dd8f9
        - name: TEMPORAL_NAMESPACE
          value: service-zip
        - name: ZIP_GOTO_TIMEOUT_MS
          value: "120000"
        - name: REGION
          value: oss-cn-qingdao
        - name: BUCKET
          value: shoteyes-temp-file
需要修改的配置
		 - name: ENVIRONMENT
          value: production



excel上线配置
temporal namespace service-excel
镜像
docker.zf.link/service-excel-new:0.0.2

        - name: EXCEL_SHARED_DIR
          value: /data/a0ca8f80e226
        - name: OSS_INTERNAL
          value: "true"
        - name: DINGTALK_WEBHOOK_URL
          value: https://oapi.dingtalk.com/robot/send?access_token=cc7ddaf4f77bea37d098f54c00786b9112b5f0f28bea0af5dfddd5f28a0dd8f9
        - name: TEMPORAL_NAMESPACE
          value: service-excel
        - name: REGION
          value: oss-cn-hangzhou
        - name: BUCKET
          value: banu-shoteyes
        - name: EXCEL_SHARELINK_SECRET
          value: 12b5784f1b6e6910


        volumeMounts:
        - mountPath: /data/a0ca8f80e226/files
          name: excel-storage

      volumes:
      - name: excel-storage
        persistentVolumeClaim:
          claimName: service-a0ca8f80e226-data


k rollout restart deploy service-a0ca8f80e226