import {ReactNode, useState} from "react";
import {Platform, View} from "react-native";

interface ResponsiveGridProps<T> {
    items: T[];
    keyExtractor: (item: T) => string | number;
    renderItem: (item: T) => ReactNode;
    minItemWidth?: number;   // smallest an item may get on web; lower = more columns
    maxColumns?: number;     // most columns on web (default 2)
    fillLastRow?: boolean;   // items in a short last row stretch to fill it
    gap?: number;
}

/**
 * Web: fits as many columns as there's room for, up to `maxColumns` (default 2),
 *      and never more columns than items, so a few items always fill the row evenly.
 * With `fillLastRow`, a short last row stretches (e.g. 3 items → 2, then 1 full width).
 * Mobile: one item per row.
 * Uses the space it's actually given, so it adapts to the sidebar and window size.
 */
export function ResponsiveGrid<T>({
                                      items,
                                      keyExtractor,
                                      renderItem,
                                      minItemWidth = 260,
                                      maxColumns = 2,
                                      fillLastRow = false,
                                      gap = 16,
                                  }: ResponsiveGridProps<T>) {
    const [width, setWidth] = useState(0);
    const isWeb = Platform.OS === "web";

    // How many items of at least minItemWidth fit side by side
    const fits = isWeb && width > 0
        ? Math.max(1, Math.floor((width + gap) / (minItemWidth + gap)))
        : 1;

    // Room available, capped at maxColumns, and never more than there are items
    const columns = Math.max(1, Math.min(fits, maxColumns, items.length));

    // Width for `count` items sharing one row
    const widthFor = (count: number) =>
        count <= 1 ? "100%" : Math.floor((width - gap * (count - 1)) / count);

    const fullRowWidth = widthFor(columns);

    // Items left over in the last row (0 = last row is full)
    const remainder = items.length % columns;
    const lastRowStart = items.length - remainder;

    return (
        <View
            onLayout={e => setWidth(e.nativeEvent.layout.width)}
            style={{flexDirection: "row", flexWrap: "wrap", gap}}
        >
            {items.map((item, index) => {
                const inShortLastRow = fillLastRow && remainder > 0 && index >= lastRowStart;
                const itemWidth = inShortLastRow ? widthFor(remainder) : fullRowWidth;

                return (
                    <View key={keyExtractor(item)} style={{width: itemWidth}}>
                        {renderItem(item)}
                    </View>
                );
            })}
        </View>
    );
}