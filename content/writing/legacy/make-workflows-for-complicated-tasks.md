+++
title = "Make workflows for complicated tasks"
date = "2015-01-26T09:20:52.001Z"
svbtleUrl = "https://myobie.svbtle.com/make-workflows-for-complicated-tasks"
+++

I've been extracting a lot of controller code into simple POROs recently, but it's become more and more difficult and repetitive to get things to work consistently. I end up doing a lot of `if` statements in the `#call` method to manage failure states. An example might be:

```ruby
# in a controller
def create
  @amount = params[:amount].to_i
  unless @amount > 100
    render :error and return
  end

  begin
    @charge = Stripe::Charge.create({
        amount: @amount,
        card: params[:card_token]
      })
  rescue Stripe::CardError => e
    render :error and return
  end

  @charge_response = StripeChargeResponse.new(body: @charge.to_hash)
  @payment = Payment.new({
    stripe_charge_response: charge_response,
    stripe_charge_id: charge.id,
    amount: charge.amount,
    currency: charge.currency
  })

  begin
    @payment.save!
  rescue ActiveRecord::RecordInvalid => e
    render :error and return
  end

  ReceiptMailer.payment_receipt(@payment).deliver_later

  redirect_to receipt_path(@payment)
end
```

After some work, I decided I should extract each step of the operation into it's own method:

```ruby
# in a controller
def create
  if grab_amount &&
     charge &&
     save_payment &&
     send_email
    redirect_to receipt_path(@payment)
  else
    render :error
  end
end

def grab_amount
  @amount = params[:amount].to_i
  @amount > 100
end

def charge
  @charge = Stripe::Charge.create({
    amount: @amount,
    card: params[:card_token]
  })
  true
rescue Stripe::CardError => e
end

def save_payment
  @charge_response = StripeChargeResponse.new(body: @charge.to_hash)
  @payment = Payment.new({
    stripe_charge_response: charge_response,
    stripe_charge_id: charge.id,
    amount: charge.amount,
    currency: charge.currency
  })

  @payment.save!
rescue ActiveRecord::RecordInvalid => e
end

def send_email
  ReceiptMailer.payment_receipt(@payment).deliver_later
  true
end
```

After that, I realized if I had a method to wrap and capture failures I could cleanup things even more:

```ruby
# in a controller
def create
  if grab_amount &&
     charge &&
     save_payment &&
     send_email
    redirect_to receipt_path(@payment)
  else
    render :error
  end
end

def define_and_capture
  yield
rescue StandardError => e
  false
end

define_and_capture :grab_amount do
  @amount = params[:amount].to_i
  @amount > 100
end

define_and_capture :charge do
  @charge = Stripe::Charge.create({
    amount: @amount,
    card: params[:card_token]
  })
  true
end

define_and_capture :save_payment do
  @charge_response = StripeChargeResponse.new(body: @charge.to_hash)
  @payment = Payment.new({
    stripe_charge_response: charge_response,
    stripe_charge_id: charge.id,
    amount: charge.amount,
    currency: charge.currency
  })

  @payment.save!
end

define_and_capture :send_email do
  ReceiptMailer.payment_receipt(@payment).deliver_later
  true
end
```

And this is way too much going on in the controller, IMHO. So making a service object for this is pretty simple:

```ruby
# in a controller
def create
  @service = ChargeACard.new(params[:amount], params[:card_token])
  if @service.call
    redirect_to receipt_path(@service.payment)
  else
    render :error
  end
end

# in it's own file
class ChargeACard
  attr_reader :payment

  def initialize(amount, card_token)
    @amount = amount
    @card_token = card_token
  end

  def call
    if grab_amount &&
       charge &&
       save_payment &&
       send_email
      true
    else
      false
    end
  end

  def define_and_capture
    yield
  rescue StandardError => e
    false
  end

  define_and_capture :grab_amount do
    @amount = params[:amount].to_i
    @amount > 100
  end

  define_and_capture :charge do
    @charge = Stripe::Charge.create({
      amount: @amount,
      card: params[:card_token]
    })
    true
  end

  define_and_capture :save_payment do
    @charge_response = StripeChargeResponse.new(body: @charge.to_hash)
    @payment = Payment.new({
      stripe_charge_response: charge_response,
      stripe_charge_id: charge.id,
      amount: charge.amount,
      currency: charge.currency
    })

    @payment.save!
  end

  define_and_capture :send_email do
    ReceiptMailer.payment_receipt(@payment).deliver_later
    true
  end
end
```

I iterated on this more and then decided I should just package up the repeatable bits into a module which I am now publishing as a gem: [Workout](https://github.com/myobie/workout).

Workout can help declare the steps needed to work through something. If any step fails then execution halts. A workflow instance knows if it's completed, valid, or successful. This means a lot of controller actions can return to the simple and amazing if success then render success, else render error. 

Most service object type libraries I see online accept their arguments into the call method, but I don't like this approach. I've made the mistake of setting instance vars in methods and those might get carried over. To me, a better approach is to always `Thing.new(args).call` each time instead.

I hope someone might also find this type of object useful.