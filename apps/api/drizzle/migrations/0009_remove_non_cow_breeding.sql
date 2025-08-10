-- Remove breeding records for cattle that are not breeding cows
DELETE FROM breeding_status
WHERE cattleId IN (
    SELECT cattleId FROM cattle WHERE growthStage NOT IN ('FIRST_CALVED','MULTI_PAROUS')
);
DELETE FROM breeding_summary
WHERE cattleId IN (
    SELECT cattleId FROM cattle WHERE growthStage NOT IN ('FIRST_CALVED','MULTI_PAROUS')
);
