CREATE OR REPLACE FUNCTION cascade_passport_revocation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'passport' AND NEW.revoked = true AND OLD.revoked = false THEN
    UPDATE verifications
    SET revoked = true
    WHERE user_id = NEW.user_id
      AND type = 'residence'
      AND revoked = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cascade_passport_revocation
  AFTER UPDATE ON verifications
  FOR EACH ROW
  EXECUTE FUNCTION cascade_passport_revocation();