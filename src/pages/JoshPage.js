import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Josh判定用ダミーページ（後方互換性のため残存）
 * 認証チェックを削除し、素通りでリダイレクト
 */
export default function JoshPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // 初期ページに遷移
    navigate("/channel/koyori");
  }, [navigate]);

  return (
    <></>
  );
}
