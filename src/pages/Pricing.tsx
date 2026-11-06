import type { Dict } from '../i18n/dict';
import type { Locale } from '../i18n/paths';
import { CellView, PageHead, PlanCard, QaList, SectionHead, Steps } from '../components/ui';

/* 价格页。
 *
 * 价格数字来自 content/prices.ts（副本，由 tests/prices.test.ts 跟真源比对），
 * 页面里一个金额字面量都没有。年付折算 $1.66 也一样——它由 PRICE_AMOUNT.yearly
 * 算出来，改价自动跟着变。
 *
 * 套餐卡片的购买按钮全部指向页内 #how-to-buy，不是直接跳结账：结账必须在
 * 扩展里进行，Pro 才会绑在正确的浏览器设定档上。这点写在卡片下面的说明里。
 */

export default function Pricing({ dict, locale }: { dict: Dict; locale: Locale }) {
  const c = dict.pricing;

  return (
    <>
      <PageHead h1={c.h1}>
        <p>{c.intro}</p>
      </PageHead>

      <section className="section section-tight">
        <div className="wrap">
          <div className="plans">
            {c.plans.map((plan) => (
              <PlanCard key={plan.tag} plan={plan} locale={locale} level={2} />
            ))}
          </div>
          <p className="note">{c.plansNote}</p>
        </div>
      </section>

      <section className="section" id="compare">
        <div className="wrap">
          <SectionHead title={c.tableTitle} sub={c.tableSub} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{c.tableHead[0]}</th>
                  <th>{c.tableHead[1]}</th>
                  <th>{c.tableHead[2]}</th>
                </tr>
              </thead>
              <tbody>
                {c.tableRows.map((row, i) => (
                  <tr key={i}>
                    <th scope="row">{row.label}</th>
                    <td>
                      <CellView cell={row.free} />
                    </td>
                    <td className="col-us">
                      <CellView cell={row.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" id="how-to-buy">
        <div className="wrap">
          <SectionHead title={c.buyTitle} sub={c.buySub} />
          <Steps steps={c.buySteps} />
          <p className="note">{c.buyNote}</p>
        </div>
      </section>

      <section className="section" id="billing">
        <div className="wrap">
          <SectionHead title={c.billingTitle} />
          <div className="card card-narrow">
            <QaList items={c.billingFaq} />
          </div>
        </div>
      </section>
    </>
  );
}
