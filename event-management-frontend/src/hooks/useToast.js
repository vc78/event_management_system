import toast from 'react-hot-toast';
export function useToast(){ return { success:(m)=>toast.success(m), error:(m)=>toast.error(m), info:(m)=>toast(m) }; }
