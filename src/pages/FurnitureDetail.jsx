import React from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Btn, Badge, Icon } from '../components/UIComponents';

export const FurnitureDetail = ({ furniture: propFurniture }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list);
  const transfersList = useSelector((state) => state.transfers.list);
  const inspectionsList = useSelector((state) => state.inspections.list);

  const furniture = propFurniture || furnitureList.find((f) => f.id === id);

  if (!currentUser) return null;

  if (!furniture) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon.Furniture />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Asset Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">No asset exists with ID "{id}".</p>
        <Btn onClick={() => navigate('/assets')}>Back to Asset List</Btn>
      </div>
    );
  }

  // Filter histories related to this specific asset
  const transfers = transfersList.filter(t => t.assetId === furniture.id);
  const inspections = inspectionsList.filter(i => i.assetId === furniture.id);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/assets')} 
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <Icon.ArrowLeft /> Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight leading-none">
              {furniture.name}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">{furniture.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Badge label={furniture.condition} type="condition" />
          <Badge label={furniture.status} />
          <Btn variant="secondary" onClick={() => navigate(`/assets/edit/${furniture.id}`)} size="sm">
            <Icon.Edit /> Edit Asset
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed specs */}
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 font-display tracking-tight">Asset Specification Profile</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-sm">
              {[
                ['Asset ID', furniture.id],
                ['Asset Name', furniture.name],
                ['Category', furniture.category],
                ['Quantity', `${furniture.quantity} units`],
                ['Condition', furniture.condition],
                ['Status', furniture.status],
                ['Building Sector', furniture.building],
                ['Department', furniture.department],
                ['Room Assigned', furniture.room],
                ['Purchase Date', furniture.purchaseDate || '—'],
                ['Acquisition Cost', `₹${furniture.cost.toLocaleString()}`],
                ['Supplier Name', furniture.supplier || '—'],
                ['Warranty Expiry', furniture.warranty || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{k}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{v}</span>
                </div>
              ))}
              <div className="sm:col-span-2 md:col-span-3 flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Description</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {furniture.description || 'No additional description provided.'}
                </span>
              </div>
            </div>
          </Card>

          {/* Transfer History Table */}
          <Card>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-white font-display text-sm tracking-tight">Location Transfer History</p>
            </div>
            {transfers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                No transfer operations logged for this asset.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase font-semibold">
                      {['Transfer ID', 'Origin Room', 'Target Room', 'Logged Date', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                    {transfers.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                        <td className="px-5 py-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{t.id}</td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-semibold">{t.source}</td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-semibold">{t.destination}</td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-500 font-medium">{t.date}</td>
                        <td className="px-5 py-3.5"><Badge label={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Inspection History Table */}
          <Card>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-white font-display text-sm tracking-tight">Condition Inspection History</p>
            </div>
            {inspections.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                No inspections recorded for this asset yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase font-semibold">
                      {['Inspection ID', 'Inspector', 'Log Date', 'Condition State', 'Notes / Remarks'].map(h => (
                        <th key={h} className="px-5 py-3.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                    {inspections.map(i => (
                      <tr key={i.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                        <td className="px-5 py-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{i.id}</td>
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-bold">{i.inspector}</td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-500 font-medium">{i.date}</td>
                        <td className="px-5 py-3.5"><Badge label={i.condition} type="condition" /></td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium max-w-xs truncate" title={i.notes}>
                          {i.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 font-display tracking-tight">Active Placement</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-semibold">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                  <Icon.Building />
                </div>
                <span>{furniture.building}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-semibold">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                  <Icon.Department />
                </div>
                <span>{furniture.department} Department</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-semibold">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                  <Icon.Room />
                </div>
                <span>Room {furniture.room}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 font-display tracking-tight">Asset Actions</p>
            <div className="space-y-2.5">
              <Btn 
                variant="secondary" 
                className="w-full justify-center cursor-pointer" 
                size="sm" 
                onClick={() => navigate('/transfers')}
              >
                <Icon.Transfer /> Create Transfer Request
              </Btn>
              <Btn 
                variant="secondary" 
                className="w-full justify-center cursor-pointer" 
                size="sm" 
                onClick={() => navigate('/inspections')}
              >
                <Icon.Inspection /> Log New Inspection
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
