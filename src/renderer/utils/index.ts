import { ElMessage } from "element-plus";
export const copyText = (text: string) => {
    const newInput = document.createElement("input");
    document.body.appendChild(newInput);
    newInput.value = text;
    newInput.select();
    document.execCommand("copy");
    document.body.removeChild(newInput);
    ElMessage({
        message: "复制成功",
        type: "success",
    });
}