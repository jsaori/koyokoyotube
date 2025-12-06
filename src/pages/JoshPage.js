import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useLocalStorage } from "../hooks/useLocalStorage";

/**
 * Josh判定用ダミーページ
 */
 export default function JoshPage() {
  // Josh判定フラグ
  // 既に認証済みであればパスワード入力をスキップ
  const [isJosh, setJosh] = useLocalStorage('josh', 'false');

  const navigate = useNavigate();
  useEffect(() => {
    if (isJosh === 'false') {
      // パスワード確認
      const pass = window.prompt("パスワード", "");

      // パスワードでJoshフラグTrue
      if (pass === process.env.REACT_APP_JOSH_KEY) setJosh('true');
    }

    // 初期ページに遷移
    navigate("/channel/koyori")
  });

  return (
    <></>
  );
}
