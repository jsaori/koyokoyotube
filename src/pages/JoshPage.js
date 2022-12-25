import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useLocalStorage } from "../hooks/useLocalStrage";

/**
 * Josh判定用ダミーページ
 */
 export default function JoshPage() {
  // Josh判定フラグ
  const [, setJosh] = useLocalStorage('josh', 'false');

  // パスワード確認
  const pass = window.prompt("パスワード", "");

  const navigate = useNavigate();
  useEffect(() => {
    // パスワードでJoshフラグTrue
    if (pass === process.env.REACT_APP_JOSH_KEY) setJosh('true');
    // 初期ページに遷移
    navigate("/channel/koyori")
  });

  return (
    <></>
  );
}
