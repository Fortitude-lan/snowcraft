import React, { useEffect, useState } from "react";
import { CustomizerCanvas } from "./CustomizeCanvas";
import { ProductCustomizationForm } from "./ItemCustomizationForm";

interface CustomizerSelectionProps {
  data: any;
  formData: any; // 父组件传入状态
  onChange: (field: string, value: any) => void; // 表单改动回调给父组件
  renderButtons?: (formData: any) => React.ReactNode;
}

function isTextureUrl(v: string): boolean {
  return typeof v === "string" && (v.startsWith("/") || v.startsWith("http"));
}

export function CustomizerSelection({
  data,
  formData,
  onChange,
  renderButtons,
}: CustomizerSelectionProps): React.ReactElement {

  const [localFormData, setLocalFormData] = useState(formData);
  // 用户上传的纹理 URL 单独保存，切换回预设后仍可回显与再次选择
  const [uploadedTextureUrl, setUploadedTextureUrl] = useState<string | null>(null);

  // useEffect(() => {
  //   const v = formData?.p_textures;
  //   if (v && isTextureUrl(String(v))) setUploadedTextureUrl(v);
  // }, [formData?.p_textures]);

  const handleFormChange = (field: string, value: any) => {
    // console.log(value)
    // debugger
    if (field === "p_img" && isTextureUrl(String(value)) && !presetTextures?.includes(value)) {
      // 只有当选中的 URL 不是预设纹理时，才更新 uploadedTextureUrl
      setUploadedTextureUrl(value);
    }
    onChange(field, value);
    setLocalFormData((prev: any) => ({ ...prev, [field]: value }));
  };


  const assetCode = data?.asset?.asset_code;
  const presetTextures = assetCode ? data?.p_textures?.[assetCode] : undefined;
  const currentPTexture = localFormData?.p_img;

  const textureUrlsForCanvas: string[] = (() => {
    if (currentPTexture) {
      return [currentPTexture];
    }
    if (!presetTextures) return [];
    const firstPresetUrl = Array.isArray(presetTextures)
      ? presetTextures[0]
      : Object.values(presetTextures as Record<string, string[]>)[0]?.[0];

    return firstPresetUrl ? [firstPresetUrl] : [];
  })();



  return (
    <div className="relative flex flex-col lg:flex-row w-full min-h-[400px] border border-gray-200 rounded-lg overflow-hidden">
      
      {/* Left: 3D Model Canvas */}
      <div className=" w-full lg:w-1/2 h-[400px] lg:h-auto relative shrink-0">
        {data.asset && (presetTextures || textureUrlsForCanvas.length > 0) && (
          <CustomizerCanvas
            assetCode={data.asset.asset_code}
            finish={localFormData?.p_finish || ""}
            textureUrls={textureUrlsForCanvas}
            customText={localFormData?.p_custom_text ?? ""}
            isDoubleSided={data?.is_double_sided !== false && data?.is_double_sided !== "false"}
            orbitControls={true}
            className="h-full w-full"
          />
        )}
      </div>

      {/* Right: Customization Parameters */}
      <div className="w-full lg:w-1/2 bg-white border-l border-gray-200 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <ProductCustomizationForm
            data={data}
            formData={localFormData}
            presetTextures={presetTextures}
            uploadedTextureUrl={uploadedTextureUrl}
            onChange={handleFormChange}
          />
        </div>
        {renderButtons && (
          <div className="p-6 flex gap-2 border-t border-gray-200 bg-white">
            {renderButtons(localFormData)}
          </div>
        )}
      </div>
    </div>
  );
}
