import React from 'react';

/**
 * UpgradeBreakdown - Displays upgrade calculation details
 * Shows breakdown of costs when upgrading from one plan to another
 */
const UpgradeBreakdown = ({ upgradeData, colors }) => {
  if (!upgradeData || !upgradeData.calculation) {
    return null;
  }

  const {
    currentPlan = {},
    upgrade = {},
    calculation = {},
    newExpiryDate,
  } = upgradeData || {};

  // Fallback for missing data
  if (!currentPlan?.name || !upgrade?.name) {
    return null;
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB').replaceAll('/', '-');
  };

  const getStatusBadgeStyle = (isPositive) => {
    return isPositive
      ? { backgroundColor: '#dcfce7', color: '#166534' }
      : { backgroundColor: '#fee2e2', color: '#991b1b' };
  };

  return (
    <div className="rounded-[2.5rem] p-8 border shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <h3 className="font-black text-lg mb-6 flex items-center gap-3" style={{ color: colors.text }}>
        <i className="fa-solid fa-arrow-up-right text-blue-500"></i> Upgrade Breakdown
      </h3>

      {/* Current Plan Summary */}
      <div className="mb-6 pb-6 border-b" style={{ borderColor: colors.border }}>
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>Current Plan</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.border }}>
            <p className="text-[10px] font-bold text-gray-400 mb-1">Plan Name</p>
            <p className="font-black text-sm" style={{ color: colors.text }}>{currentPlan.name}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.border }}>
            <p className="text-[10px] font-bold text-gray-400 mb-1">Duration</p>
            <p className="font-black text-sm" style={{ color: colors.text }}>{currentPlan.duration} Days</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.border }}>
            <p className="text-[10px] font-bold text-gray-400 mb-1">Used Days</p>
            <p className="font-black text-sm" style={{ color: colors.text }}>{currentPlan.usedDays} Days</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.border }}>
            <p className="text-[10px] font-bold text-gray-400 mb-1">Remaining</p>
            <p className="font-black text-sm text-green-500">{currentPlan.remainingDays} Days</p>
          </div>
        </div>
      </div>

      {/* New Plan Summary */}
      <div className="mb-6 pb-6 border-b" style={{ borderColor: colors.border }}>
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>New Plan</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.border }}>
            <p className="text-[10px] font-bold text-gray-400 mb-1">Plan Name</p>
            <p className="font-black text-sm" style={{ color: colors.text }}>{upgrade.name}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.border }}>
            <p className="text-[10px] font-bold text-gray-400 mb-1">Total Duration</p>
            <p className="font-black text-sm" style={{ color: colors.text }}>{upgrade.duration} Days</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.border }}>
            <p className="text-[10px] font-bold text-gray-400 mb-1">Additional Days</p>
            <p className="font-black text-sm text-blue-500">+{upgrade.additionalDaysGained} Days</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mb-6 pb-6 border-b" style={{ borderColor: colors.border }}>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: colors.textMuted }}>Cost Breakdown</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: colors.border }}>
            <span className="font-bold text-sm" style={{ color: colors.text }}>New Plan Price</span>
            <span className="font-black text-sm" style={{ color: colors.text }}>₹{calculation.newPlanPrice}</span>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: colors.border }}>
            <span className="font-bold text-sm flex items-center gap-2" style={{ color: colors.text }}>
              Less: Remaining Value
              <span className="px-2.5 py-0.5 text-[10px] font-black rounded" style={getStatusBadgeStyle(true)}>
                CREDIT
              </span>
            </span>
            <span className="font-black text-sm text-green-500">-₹{calculation.discountApplied}</span>
          </div>

          <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
            <span className="font-black text-sm" style={{ color: '#ffffff' }}>Final Amount to Pay</span>
            <span className="font-black text-2xl" style={{ color: '#ffffff' }}>₹{calculation.amountToCharge}</span>
          </div>

          <p className="text-center text-[10px] font-bold text-green-600 mt-2">
            💰 You Save ₹{calculation.discountApplied} ({calculation.percentageSaved}% discount)
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: colors.textMuted }}>Timeline</p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.border }}>
            <p className="text-[10px] font-bold text-gray-400 mb-1">Plan Expires On</p>
            <p className="font-black text-sm" style={{ color: colors.text }}>{formatDate(newExpiryDate)}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-2">
              Total validity after upgrade: {upgrade.duration} days from today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeBreakdown;
