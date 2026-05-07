-- RPC: Invite-Nutzung hochzählen (aufgerufen aus API-Route)
CREATE OR REPLACE FUNCTION increment_invite_use_count(p_token TEXT, p_user_id UUID DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE invite_tokens
  SET
    use_count = use_count + 1,
    used_by   = COALESCE(p_user_id, used_by),
    used_at   = CASE WHEN used_at IS NULL THEN NOW() ELSE used_at END
  WHERE token = p_token;
END;
$$;

-- Ersten Admin-Nutzer setzen (nach erster Registrierung ausführen)
-- UPDATE profiles SET role = 'admin' WHERE email = 'deine@email.de';
