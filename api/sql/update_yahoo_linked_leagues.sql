INSERT INTO linkedids(
    linkedid, mainid
)
VALUES %s
ON CONFLICT (linkedid) DO NOTHING