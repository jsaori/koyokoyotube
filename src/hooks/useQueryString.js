import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * クエリ文字列の取得と更新を管理するカスタムフック
 * @returns {Object} { query, updateQuery, buildQueryString }
 */
export function useQueryString() {
  const location = useLocation();
  const navigate = useNavigate();

  // 現在のクエリパラメータを取得
  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return Object.fromEntries(params.entries());
  }, [location.search]);

  // クエリパラメータを更新してナビゲート
  const updateQuery = useCallback((updates, options = {}) => {
    const { excludeKeys = [], resetPage = false } = options;
    const params = new URLSearchParams(location.search);
    
    // 更新を適用
    Object.keys(updates).forEach((key) => {
      if (updates[key] === null || updates[key] === undefined || updates[key] === "") {
        params.delete(key);
      } else {
        params.set(key, updates[key]);
      }
    });

    // 除外キーを削除
    excludeKeys.forEach((key) => {
      params.delete(key);
    });

    // ページをリセットする場合
    if (resetPage) {
      params.delete("page");
    }

    // ナビゲート
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
  }, [location.pathname, location.search, navigate]);

  // クエリ文字列を構築（後方互換性のため）
  const buildQueryString = useCallback((queryObj, excludeKeys = []) => {
    const params = new URLSearchParams();
    Object.keys(queryObj).forEach((key) => {
      if (!excludeKeys.includes(key) && queryObj[key] !== null && queryObj[key] !== undefined && queryObj[key] !== "") {
        params.set(key, queryObj[key]);
      }
    });
    return params.toString();
  }, []);

  return { query, updateQuery, buildQueryString };
}
