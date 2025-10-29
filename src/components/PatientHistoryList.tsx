import React, {useState} from "react";
import type {RecommendationWithVas} from "../types/common/types.ts";
import {Button} from "./ui";

const PatientHistoryList: React.FC<{ history: RecommendationWithVas[] }> = ({history}) => {
    const [visibleCount, setVisibleCount] = useState(1);
    const showMore = () => setVisibleCount((prev) => prev + 1);

    return (
        <div className="space-y-4">
            {history.slice(0, visibleCount).map((item, index) => (
                <div
                    key={index}
                    className="flex flex-col md:flex-row border rounded-lg bg-gray-50 hover:bg-gray-100 transition p-4"
                >
                    {/* LEFT: VAS block — 30% ширины */}
                    <div className="md:w-[30%] md:pr-4 border-b md:border-b-0 md:border-r border-gray-200 mb-3 md:mb-0">
                        <h4 className="font-semibold text-blue-700 mb-2">VAS</h4>
                        <p className="text-sm text-gray-700">
                            <strong>Pain Level:</strong> {item.vas.painLevel}/10
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Location:</strong> {item.vas.painPlace}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {item.vas.createdAt ? new Date(item.vas.createdAt).toLocaleString() : "N/A"}
                        </p>
                    </div>

                    {/* RIGHT: Recommendation block — 70% ширины */}
                    <div className="md:w-[70%] md:pl-4">
                        <h4 className="font-semibold text-green-700 mb-2">Recommendation</h4>

                        {/* Список препаратов */}
                        {Array.isArray(item.recommendation.drugs) && item.recommendation.drugs.length > 0 ? (
                            <ul className="space-y-1 text-sm text-gray-700">
                                {item.recommendation.drugs.slice(0, 2).map((drug, i) => (
                                    <li key={i} className="border-b border-gray-200 pb-1 text-sm text-gray-700">
                                        <div>
            <span className="font-semibold text-gray-800">
                {drug.drugName || "N/A"}
            </span>
                                            {" — "}
                                            <span className="italic text-gray-600">
                Active ingredient: {drug.activeMoiety || "N/A"}
            </span>
                                        </div>
                                        <div>
                                            <span>dosing: {drug.dosing || "N/A"}</span>
                                            {" / "}
                                            <span className="italic text-gray-600">
                interval: {drug.interval || "N/A"}
            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-gray-500 italic">No drug data available</p>
                        )}

                        {/* Статус — мелким шрифтом */}
                        <p className="text-xs text-gray-500 mt-2">
                            Status: {item.recommendation.status}
                        </p>
                        {/* Комментарии из recommendation.comments */}
                        {Array.isArray(item.recommendation.comments) && item.recommendation.comments.length > 0 && (
                            <div className="mt-2">
                                <p className="text-xs font-semibold text-gray-500 mb-1">Comments:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                    {item.recommendation.comments.map((comment, i) => (
                                        <li key={i} className="text-xs text-gray-600 italic">
                                            {comment}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    {/* Причина отклонения, если есть */}
                    {item.recommendation.rejectedReason && (
                        <p className="text-xs text-red-600 mt-1">
                            ❌ Rejection Reason: <span className="italic">{item.recommendation.rejectedReason}</span>
                        </p>
                    )}
                </div>
            ))}

            {visibleCount < history.length && (
                <div className="text-center pt-2">
                    <Button variant="outline" onClick={showMore}>
                        View More ({history.length - visibleCount} remaining)
                    </Button>
                </div>
            )}
        </div>
    );

};

export default PatientHistoryList;